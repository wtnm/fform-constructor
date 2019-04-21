import * as React from 'react';

import {FForm, FFormStateAPI, elements, fformCores} from 'fform/src/fform';
import constrSchema from './constrSchema';
import constrObj from './constrLib';
import * as styling from 'fform/addons/styles.json';
import {getCreateIn, getIn, isArray, isEqual, isFunction, isUndefined, merge, objKeys, toArray} from "fform/src/commonLib";
import {formValues2JSON, JSON2formValues} from './constrUtils'
import {object2PathValues, path2string, SymData, types} from "fform/src/stateLib";
import Popup from "reactjs-popup";
// import constrSchema from './constrSchema'

const LZString = require('lz-string');

const getStorage = function (key: string) {
  return JSON.parse(
    LZString.decompress(
      localStorage.getItem(key) || ''
    )
  );
};

const setStorage = function (key: string, value: any) {
  key && localStorage.setItem(
    key,
    LZString.compress(
      JSON.stringify(value)
    )
  );
};

document && document.body.addEventListener("keydown", function (e) {
  e = e || window.event;
  if (e.ctrlKey) {
    if ((e.code == 'KeyC' || e.code == 'KeyX')) {
      if (!window['_RefFFormConstructor']) return;
      let rootField = window['_RefFFormConstructor'].getRef('/@');
      mainElements._usr.cutCopyField.call(rootField, e.code == 'KeyC')
    } else if (e.code == 'KeyV') {
      if (!window['_RefFFormConstructor']) return;
      let rootField = window['_RefFFormConstructor'].getRef('/@');
      mainElements._usr.pasteField.call(rootField)
    }
  }
}, false);

const schemaTemplate = {
  "elements": {
    "links": [
      {
        "import": [],
        "from": "styles.json"
      }
    ]
  },
  "css": {
    "links": [
      "tacit.min.css",
      "style.css"
    ]
  },
};

function getJSONType(value: any) {
  let type = value === null ? 'null' : typeof value;
  if (type == 'number' && types.integer(value)) type = 'integer';
  if (type == 'object' && types.array(value)) type = 'array';
  return type
}

function json2schema(value: any) {
  const schema: any = {};
  // if (objKeys(value).length === 1) {
  //   const title = objKeys(value)[0];
  //   schema.title = title;
  //   value = value[title];
  // }
  const type = getJSONType(value);
  schema.type = [type];

  if (type == 'array') {
    schema['items'] = {};
    value.forEach((v: any) => schema['items'] = merge(schema['items'], json2schema(v),
      {arrays: (a: any, b: any, p: Path) => (p[p.length - 1] == 'type') ? Array.from(new Set(toArray(a).concat(b))) : b}));
  } else if (type == 'object') {
    schema['properties'] = {};
    objKeys(value).forEach(k => {
      schema['properties'][k] = json2schema(value[k]);
      schema['properties'][k].title = k;
    })
  } else {

  }
  return schema;
}


const mainLib = {
  _usr: {
    setFromValue: function (fromValueParam: boolean, value: string = '') {
      if (fromValueParam && value) {
        try {
          value = JSON.parse(value);
          this.api.set('./@/value2schemaError', '')
        } catch (e) {
          this.api.set('./@/value2schemaError', e.message)
        }
        let schema = json2schema(value);
        this.api.set('./code/@/value', schema, {replace: true});
        this.api.set('./@/value2schema', '')
      }
      this.api.set('./@/params/fromValue', !fromValueParam)
    },
    addSchema: function () {
      let value = this.api.get('./value@value');
      if (!isArray(value)) value = [];
      // const num = objKeys(value).length;
      value = value.concat(schemaTemplate);
      this.api.set('./value@value', value, {replace: true});
      this.api.set('./selector@value', (value.length - 1).toString());
    },
    delSchema: function () {
      let selector = this.api.get('./selector@value');
      if (selector) {
        let value = this.api.get('./value@value');
        value = [...value];
        value.splice(selector, 1);
        this.api.set('./selector@value', '');
        this.api.set('./value@value', value, {replace: true});
      }
    },
    schemaNames: function (value: any) {
      value = this.api.get(this.from);
      this.api.set(this.to, objKeys(value).map(v => v.toString()));
      const enumExten = {};
      objKeys(value).forEach(v => (enumExten[v] = {label: value[v].name}));
      this.api.set(this.to + 'Exten', enumExten);
    },
    jsonParse: function (v: string) {
      try {
        let res = JSON.parse(v);
        this.api.set('./@messages/0/texts/4', '');
        return [res, {replace: true}];
      } catch (e) {
        this.api.set('./@messages/0/texts/4', e.message);
        return [undefined, {path: null}]
      }
    },
    showOnly: function (path: string, ...args: string[]) {
      this.api.set(null);
      this.api.showOnly(path + args.filter(v => v).join(','))
    },
    setViewerValue: function (values: any, selector: string) {
      if (selector !== '') this.api.set(this.to, values[selector], {replace: true});
      this.api.set('./@/num', selector, {replace: true});
    },
    cutCopyField: function (copy = false) {
      let fieldSelected = this.api.get('/@/fieldSelected');
      if (fieldSelected) {
        const schemaApi = fformCores('FFormSchema');
        const value = schemaApi.getValue({path: fieldSelected});
        this.api.set('/@/fieldSaved', value, {replace: true});
        if (!copy) {
          schemaApi.arrayItemOps(fieldSelected, 'del');
          schemaApi.set(fieldSelected + '@/params/fieldSelected', false);
          this.api.set('/@/fieldSelected', '');
        }
      }
    },
    pasteField: function () {
      let fieldSelected = this.api.get('/@/fieldSelected');
      const value = this.api.get('/@/fieldSaved');
      if (fieldSelected && value) {
        this.api.set('/@/fieldSelected', '');
        const schemaApi = fformCores('FFormSchema');
        schemaApi.set(fieldSelected + '@/params/fieldSelected', false);
        schemaApi.setValue(value, {path: fieldSelected, replace: true});
      }
    },
    undoRedo: function (step: -1) {
      const num = this.api.get('/selector@value');
      let undoRedo = getCreateIn(this, [], 'props', 'pFForm', 'undoRedo', num);
      if (undoRedo[undoRedo.idx + step]) {
        undoRedo.idx = undoRedo.idx + step;
        const values = undoRedo[undoRedo.idx];
        this.api.setValue(values, {path: ['value', num], replace: true});
        this.api.set('/@undoDisabled', undoRedo.idx === 0);
        this.api.set('/@redoDisabled', undoRedo.idx >= undoRedo.length - 1);
      }
    },
    updSchema: function (values: any) {
      const num = this.api.get('/selector@value');
      this.api.setValue(values, {path: ['value', num], replace: true});
      let undoRedo = getCreateIn(this, [], 'props', 'pFForm', 'undoRedo', num);

      if (!isEqual(undoRedo[undoRedo.idx || 0], values, {deep: true})) {//(redo[(redo.idx || 0) - 1] !== values) {
        if (isUndefined(undoRedo.idx)) undoRedo.idx = -1;
        undoRedo.length = undoRedo.idx + 1;
        undoRedo.push(values);
        undoRedo.idx = undoRedo.length - 1;
        this.api.set('/@undoDisabled', undoRedo.idx === 0);
        this.api.set('/@redoDisabled', true);
        let fieldSelected = this.api.get('/@/fieldSelected');
        if (fieldSelected) {
          fformCores('FFormSchema').set(fieldSelected + '@/params/fieldSelected', false);
          this.api.set('/@/fieldSelected', '');
        }
      }
    }
  },
  _validators: {
    testLink: async function (lnk: string) {
      //console.log('testLink ', this.path);

      try {
        let module = await fetch(lnk);

        if (module.status !== 200) return 'Response status ' + module.status;
        return '';
      } catch (e) {
        return e.message;
      }
    }
  }

};

const editFormElements = elements.extend([styling, constrObj]);
const mainElements = editFormElements.extend([mainLib]);

function getElements() {
  return mainElements
}

if (typeof window != 'undefined') {
  window['_setIframeErrors'] = function (data: any) {
    const api = fformCores('FFormViewer');
    (window['_messages2remove'] || []).forEach((path: any) => api.set([path, '@messages/0/texts/3'], []));
    window['_messages2remove'] = [];
    const {dataErrors} = data;
    object2PathValues(dataErrors).forEach(path => {
      const value = path.pop();
      window['_messages2remove'].push(path);
      api.set(path, 0, {[SymData]: ['status', 'untouched'], macros: 'switch'});
      api.set([path, '@messages/0/texts/3'], [value])
    })
  };
}

class IFrameViewer extends React.Component<any, any> {
  _$ref: any;

  constructor(props: any, context: any) {
    super(props, context);
    const self = this;
  }

  shouldComponentUpdate(nextProps: Readonly<any>, nextState: Readonly<any>, nextContext: any): boolean {
    const self = this;
    if (!nextProps.className.hidden && self._$ref && self.props.value !== nextProps.value) {
      self._$ref.contentWindow._setForm && self._$ref.contentWindow._setForm(nextProps.value)
    }
    return !isEqual(self.props, nextProps, {skipKeys: ['value']})
  }

  render() {
    let search: any = window.location.search.substr(1);
    search = search.split("&").map((v: any) => v.split("=")).reduce((pre: any, [key, value]: any) => ({...pre, [key]: value}), {});
    const src = (!search.src || ~search.src.indexOf('.min')) ? 'viewer.min' : 'viewer';
    const self = this;
    const {className} = self.props;
    return <iframe ref={(r: any) => r && (self._$ref = r) && self.props.value && r.contentWindow._setForm && r.contentWindow._setForm(self.props.value)}
                   className={className} src={"index.html?src=" + src}/>
  }
}


const viewerSchema: JsonSchema = {
  definitions: {
    jsonEditor: (constrSchema as any).definitions.jsonEditor,
    reactSelectArray: {
      type: 'array',
      ff_managed: true,
      ff_presets: '^/_usrSets/reactSelect:^/_usrSets/rsMulti:$inlineArrayControls:$arrayControls3but',
      ff_placeholder: 'Enter values,,,'
    },
  },

  type: 'object',
  ff_data: {selector: {value: 'schema', enum: ['form', 'schema', 'elements', 'css', 'props',]}},
  ff_dataMap: [{from: './@/selector/value', to: './@/selector/none', $: '^/fn/api', args: ['showOnly', '${0}']}],
  ff_layout: {
    style: {marginLeft: '1em', display: 'block'},
    $_fields: [{
      className: {inline: false}, $_fields: [
        {
          className: {shrink: true, inline: true},
          style: {marginLeft: '0em', marginBottom: '0.5em'},
          $_ref: '^/parts/RadioSelector'
        },
        {
          _$widget: IFrameViewer,
          className: {height: true},
          $_maps: {
            'className/hidden': {$: '^/fn/equal|^/fn/not', args: ['@/selector/value', 'form']},
            value: '@current'
          }
        }
      ]
    }]
  },
  properties: {
    schema: {
      type: 'object',
      ff_data: {
        value2schema: '', value2schemaError: ''
      },

      ff_layout: [
        'links',
        'code',
        {
          _$widget: '^/widgets/Input',
          _$cx: '^/_$cx',
          type: 'textarea',
          className: {height: true, 'wrapper-margin': true},
          onChange: {$: '^/fn/eventValue|^/fn/setValue', args: ['${0}', {path: './@value2schema', execute: true}]},
          $_maps: {
            'className/hidden': {$: '^/fn/not', args: '@/params/fromValue'},
            value: '@value2schema',
          }
        },
        {
          children: [],
          $_maps: {
            'className/hidden': {$: '^/fn/not', args: '@/params/fromValue'},
            'children/0': '@value2schemaError',
          }
        },
        {
          $_ref: '^/parts/Button',
          children: [],
          onClick: {$: '^/_usr/setFromValue', args: ['@/params/fromValue', '@/value2schema']},
          $_maps: {
            'children/0': {$: '^/fn/iif', args: ['@/params/fromValue', 'Enter value and click to make schema', 'Make schema from value']},
            'className/selected': {args: '@/params/fromValue'},
          }
        }
      ],
      properties: {
        links: {
          title: 'Links',
          type: 'array',
          items: {
            type: 'object',
            ff_presets: 'object:$inlineLayout:$inlineArrayControls:$arrayControls3but',
            properties: {
              path: {
                title: 'path',
                type: 'string',
                ff_presets: 'string:$inlineTitle'
              },
              link: {
                title: 'link',
                type: 'string',
                ff_presets: 'string:$inlineTitle',
                ff_validators: ['^/_validators/testLink'],
              }
            }
          }
        },
        code: {
          type: 'object',
          ff_managed: true,
          ff_presets: 'textarea',
          ff_dataMap: [
            {from: '../@/params/fromValue', to: './@/params/hidden'}

          ],
          ff_custom: {
            Main: {
              className: {height: true},
              onChange: {$: '^/fn/eventValue|^/_usr/jsonParse|^/fn/setValue'},
              $_maps: {
                value: {$: '^/_usr/jsonStringify', args: ['@value', null, 4]}//
              }
            }
          }
        }
      }

    },
    elements: {
      type: 'object',
      properties: {
        links: {
          title: 'Links',
          type: 'array',
          items: {
            type: 'object',
            ff_presets: 'object:$inlineLayout:$inlineArrayControls:$arrayControls3but',
            properties: {
              import: {
                allOf: [{$ref: '#/definitions/reactSelectArray'},
                  {
                    title: 'import',
                    items: {type: 'string'},
                    ff_custom: {
                      $_ref: '^/sets/$inlineTitle:^/sets/$expand',
                    }
                  }],
              },
              from: {
                title: 'from',
                type: 'string',
                ff_presets: 'string:$inlineTitle',
                ff_validators: ['^/_validators/testLink'],
              }
            }
          }
        },
        code: {
          type: 'string',
          title: 'Code',
          ff_presets: 'textarea',
          ff_custom: {Main: {className: {height: true}}}
        }
      }
    },
    css: {
      type: 'object',
      properties: {
        links: {
          title: 'Links',
          type: 'array',
          items: {
            type: 'string',
            ff_presets: 'string:$inlineArrayControls:$arrayControls3but',
            ff_validators: ['^/_validators/testLink'],
          }
        },
        cxBind: {
          type: 'string',
          ff_presets: 'string:$inlineTitle',
          title: 'Bind cx to:',
          ff_validators: ['^/_validators/testLink'],
        },
        code: {
          type: 'string',
          title: 'Code',
          ff_presets: 'textarea',
          ff_custom: {Main: {className: {height: true}}}
        }
      }
    },
    props: {
      type: 'object',
      properties: {
        jsonValidation: {
          type: "boolean",
          ff_presets: 'booleanLeft:$inlineTitle:$shrink',
          ff_custom: {Main: {className: {'radio-container': true}, children: {'1': {style: {width: '100%', textAlign: 'center'}}}}},
          title: 'JSON schema Validation'
        },
        rest: {
          allOf: [{$ref: '#/definitions/jsonEditor'}]
        }
      }
    }

  }
};


class ConstrView extends React.PureComponent<any, any> {
  schemaCore = new FFormStateAPI({schema: constrSchema, name: "FFormSchema", elements: editFormElements});
  viewerCore = new FFormStateAPI({schema: viewerSchema, name: "FFormViewer", elements: mainElements});
  //mainApi = fformCores('FFormConstructor');
  _jsonValues: any;
  _formValues: any;
  savedNum: string = '';

  constructor(props: any, context: any) {
    super(props, context);
    const self = this;
    self._viewerChange = self._viewerChange.bind(self);
    self._schemaChange = self._schemaChange.bind(self);
    // self.viewerCore.set([], 0, {[SymData]: ['status', 'untouched'], execute: true, macros: 'switch'});
    if (props.num) self._syncValues(props.value);
  }

  _syncValues(values: any) {
    const self = this;
    const jsonValues = getIn(values, 'schema', 'code') || {};
    if (self._jsonValues !== jsonValues) {
      self._jsonValues = jsonValues;
      self._formValues = JSON2formValues(self._jsonValues, getIn(values, 'name') || '');
    }
  }

  _viewerChange(values: any) {
    const self = this;
    let num = self.props.num;//mainApi.get('/selector@value');
    if (num) {
      //if (self._formValues.name !== self.props.name) self.mainApi.setValue(self._formValues.name, {path: ['value', num, 'name'], replace: true});
      //self.mainApi.setValue(values, {path: ['value', num], replace: true});
      self.props.updSchema(values);
      self._syncValues(values);
    }
  }

  _schemaChange(formValues: any) {
    const self = this;
    const errorsUPD: string[] = [];
    self._formValues = formValues;
    self._jsonValues = formValues2JSON(formValues, [], errorsUPD);
    let viewerValues = {
      ...(self.props.value || {}),
      schema: {...(getIn(self.props.value, 'schema') || {}), code: self._jsonValues},
      name: formValues.name || ''
    };
    self._viewerChange(viewerValues);
    self.viewerCore.set('#/schema/code@messages/0/texts/3', errorsUPD.length ? errorsUPD : [])
  }

  render() {
    let self = this;
    if (self.props.num) self._syncValues(self.props.value);
    else return null;

    return (<div className='inline layout'>
      <FForm parent={self.props.$FField.pFForm} touched _$useTag='div' className='layout' style={{width: '55%'}} core={self.schemaCore} {...(self.props.schemaProps || {})}
             disabled={self.props.disabled} value={self._formValues} onChange={self._schemaChange}/>
      <FForm touched _$useTag='div' className='layout' style={{width: '45%'}} core={self.viewerCore} {...(self.props.viewerProps || {})}
             disabled={self.props.disabled} value={self.props.value} onChange={self._viewerChange}/>
    </div>)
  }
}


const mainSchema: JsonSchema = {
  type: 'object',
  ff_layout: [{
    className: {inline: true}, $_fields: [
      {
        $_ref: '^/parts/Button',
        title: 'undo',
        children: ['⤾'],
        style: {marginRight: '-1px'},
        className: {bold: true},
        $_maps: {
          'disabled': '@undoDisabled'
        },
        onClick: {$: '^/_usr/undoRedo', args: [-1]}
      },
      {
        $_ref: '^/parts/Button',
        title: 'redo',
        children: ['⤿'],
        className: {bold: true},
        $_maps: {
          'disabled': '@redoDisabled'
        },
        onClick: {$: '^/_usr/undoRedo', args: [1]}
      },
      {
        $_ref: '^/parts/Button',
        title: 'cut',
        children: ['✂'],
        style: {marginRight: '-1px'},
        className: {bold: true},
        $_maps: {
          'disabled': '!@/fieldSelected'
        },
        onClick: {$: '^/_usr/cutCopyField', args: [false]}
      },
      {
        $_ref: '^/parts/Button',
        title: 'copy',
        children: ['⧉'],
        style: {marginRight: '-1px'},
        className: {bold: true},
        $_maps: {
          'disabled': '!@/fieldSelected'
        },
        onClick: {$: '^/_usr/cutCopyField', args: [true]}
      },
      {
        $_ref: '^/parts/Button',
        title: 'paste',
        children: ['📋'],
        style: {marginRight: '1em'},
        className: {bold: true},
        $_maps: {
          'disabled': {$: '^/fn/equal', args: [false, '!!@/fieldSelected', '!!@/fieldSaved']}
        },
        onClick: {$: '^/_usr/pasteField'}
      },
      {
        $_ref: '^/parts/Button',
        children: ['*'],
        className: {bold: true},
        $_maps: {
          'className/selected': {$: '^/fn/equal', args: ['@selectorValue', '']}
        },
        onClick: {$: '^/fn/setValue', args: ['', {path: './selector@value'}]}
      },
      'selector',
      {
        $_ref: '^/parts/Button',
        children: ['+schema'],
        onClick: {$: '^/_usr/addSchema', args: [1]},
        style: {marginRight: '-1px', marginLeft: '1.5em'}
      },
      {
        $_ref: '^/parts/Button',
        children: ['delete'],
        onClick: {$: '^/_usr/delSchema', args: [1]}
      }
    ]
  }],
  properties: {
    selector: {
      type: 'string',
      default: '',
      ff_presets: 'radio:$inlineItems:$inlineTitle:$shrink',
      ff_dataMap: [{from: './@/value', to: '../@/selectorValue'}],
      ff_custom: {Main: {className: {wrap: true}}}
    },

    value: {
      type: ['array', 'object'],
      default: [],
      items: {type: 'object'},
      ff_managed: true,
      ff_dataMap: [
        {from: './@/value', to: '../selector/@/fData/enum', $: '^/_usr/schemaNames', replace: false},
        {from: '../selector@value', to: './@/selectorValue'},
        {from: './@/selectorValue', to: './@params/hidden', $: '^/fn/equal|^/fn/not', args: ['${0}', '']},
        {from: './@/value,selectorValue', to: '../viewer@value', $: '^/_usr/setViewerValue', args: ['@value', '@selectorValue']}

      ],
      ff_presets: 'textarea',
      ff_custom: {
        Main: {
          style: {height: '80vh'},
          onChange: {$: '^/fn/eventValue|^/_usr/jsonParse|^/fn/setValue'},
          $_maps: {
            value: {$: '^/_usr/jsonStringify', args: ['@value', null, 4]}
          }
        }
      }
    },
    viewer: {
      type: 'object',
      ff_managed: true,
      ff_presets: 'base',
      ff_dataMap: [{from: './@num', to: './@params/hidden', $: '^/fn/equal', args: ['${0}', '']}],
      ff_custom: {
        Main: {
          _$widget: ConstrView,
          updSchema: '^/_usr/updSchema',
          $_maps: {
            $FField: {$: '^/fn/getProp', args: [], update: 'build'},
            value: {args: '@value', replace: true},
            num: '@num',
            disabled: '@/params/disabled'
          }
        }
      }
    }
  }
};


function showPopup(text: string) {
}

function testJSONdata(data: any) {
  return true
}

async function getDataFromUrl(hash2Obj: { url: string, selector?: string }, self: any) {
  try {
    let file = await fetch(hash2Obj.url);
    if (file.status != 200) throw new Error('Url responce status ' + file.status);
    let value = await (file).json();
    // value = JSON.parse(value);
    if (testJSONdata(value)) {
      const selector = decodeURI(hash2Obj.selector || '');
      //self.core.switch('/@/params/disabled', false);
      self.core.setValue({selector, value, viewer: selector ? value[selector] : {}}, {execute: true, replace: true});
      return
    }
  } catch (e) {
    self.openModal(['Failed to load data with error: ', <b key='bold'>{e.message}</b>, <br key='br'/>, ' Switched to local data.']);
  }
  //self.core.switch('/@/params/disabled', false);
  self.setStorage();
}

class MainView extends React.PureComponent<any, any> {
  core = new FFormStateAPI({schema: mainSchema, name: "FFormConstructor", elements: mainElements});
  state = {open: false, text: ''};

  constructor(props: any, context: any) {
    super(props, context);
    const self = this;
    let hash = window.location.hash.substring(1);
    // hash = 'url=fg';
    if (hash) {
      let hash2Obj: any = hash.split("&").map(v => v.split("="))
        .reduce((pre, [key, value]) => ({...pre, [key]: value}), {});
      if (hash2Obj.url) {
        //self.core.switch('/@/params/disabled', true);
        getDataFromUrl(hash2Obj, self);
        self.core.set('/@/storageName', '');
        return;
      }
    }
    self.setStorage();
  }

  openModal = (text: any) => {
    this.setState({open: true, text})
  };

  closeModal = () => {
    this.setState({open: false})
  };

  setStorage(name = 'fformSchemas') {
    const self = this;
    self.core.set('/@/storageName', name);
    try {
      let data = getStorage(name);
      if (data && testJSONdata(data)) self.core.setValue(data, {execute: true, replace: true})
    } catch (e) {
      self.openModal(['Failed to load data with error: ', <b key='bold'>{e.message}</b>, <br key='br'/>, '']);
    }
  }

  render() {
    let self = this;
    return (<div>
      <Popup open={this.state.open} closeOnDocumentClick onClose={this.closeModal}>
        <div className="modal">
          <a className="close" onClick={this.closeModal}>×</a>
          {self.state.text}
        </div>
      </Popup>
      <FForm ref={(r) => window && (window['_RefFFormConstructor'] = r)} touched _$useTag='div' onChange={(v: any) => setStorage(self.core.get('/@/storageName'), v)} core={self.core} {...self.props}/>
    </div>)
  }
}

export default MainView;
export {getElements}


// index.html#url=examples.json&selector=0