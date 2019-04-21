import * as React from 'react';
import {render} from 'react-dom';

import {FForm, FFormStateAPI, elements as fformElements} from 'fform/src/fform';
import {getIn, isObject, isString, isUndefined, makeSlice, merge, objKeys, push2array, setIn} from "fform/src/commonLib";

import {importModule} from "./importModule";
import {normalizePath, string2path} from "fform/src/stateLib";

import imjvWrapper from 'fform/addons/imjvWrapper';
import {formObj2JSON, JSON2formObj} from "./constrUtils";

const imjvValidator: any = require('fform/addons/is-my-json-valid-lite');
const JSONV = imjvWrapper(imjvValidator);

import Select from 'react-select';

window['Select'] = Select;

// let a = {
//   wifgets: {
//     reactSelect: window['Select']
//   },
//   fn: {
//     reactSelectParse: function (values) {
//       if (!Array.isArray(values)) return values.value;
//       return [values.map(function (item) {return item.value})]
//     },
//     reactSelectValue: function (values = []) {
//       if (!Array.isArray(values)) return {value: values, label: values};
//       return [values.map(function (value) {return {value, label: value}})]
//     },
//   },
//   sets: {
//     reactSelect: {
//       $_ref: '^/sets/nBase',
//       Main: {
//         _$useTag: '^/_widgets/Select',
//         $_reactRef: {tagRef: true},
//         isMulti: true,
//         onChange: {$: '^/fn/reactSelectParse|setValue|updCached'},
//         $_maps: {
//           value: {$: '^/fn/reactSelectValue', args: ['@/value']},
//           options: {$: '^/fn/reactSelectValue', args: ['@/fData/enum']},
//           isDisabled: '@/params/disabled'
//         },
//       },
//     },
//   }
// }

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class ShowErrors extends React.PureComponent<any, any> {
  //state: any = {};

  render() {
    let self = this;
    if (!(window['_errorText'] || []).length) return null;
    return <div>{window['_errorText']}</div>
  }
}


class ErrorBoundary extends React.Component {
  state = {hasError: false, error: undefined};

  componentDidCatch(error: any, info: any) {
    this.setState({hasError: true, error});
  }

  render() {
    if (this.state.hasError) {
      return <div>{(this.state.error || '').toString()}</div>;
    } else {
      return this.props.children;
    }
  }
}


class Viewer extends React.PureComponent<any, any> {
  core: any;
  key = 0;

  //state: any = {};

  // componentDidCatch(errorString: any, errorInfo: any) {
  //   window['_setErrors']('error', errorString.toString());
  // }


  render() {
    let self = this;
    //if (getIn(self.state, 'css', 'code')) cssCode= React.createElement('style', {key: css.length}, getIn(self.state, 'css', 'code')));
    let {name, css, schema, elements, formProps = {}} = window['_viewerData'] || {} as any;
    let cssLinks = (getIn(css, 'links') || []).map((lnk: string, i: number) => <link key={i} rel="stylesheet" type="text/css" href={lnk}/>);
    const JSONValidator = getIn(formProps, 'jsonValidation') ? JSONV : undefined;
    let propsVals = formObj2JSON(formProps.rest || {value: ''});
    if (!isObject(propsVals)) propsVals = {};
    // objKeys(propsVals).forEach(k => {
    //   if (isObject(propsVals[k]) && propsVals[k].$) {
    //     let $;
    //     eval('$=' + propsVals[k].$);
    //     propsVals[k] = $;
    //   } else if (isString(propsVals[k]) && propsVals[k].substr(0, 2) == '^/')
    //     propsVals[k] = getIn(elements, string2path(propsVals[k].substr(2)))
    // });
    let core = schema ? new FFormStateAPI({schema, elements, name: 'form', JSONValidator}) : null;
    let cssCode = getIn(css, 'code');

    return core ? (<div>{cssLinks}
        {cssCode ? <style>{cssCode}</style> : ''}
        <FForm key={self.key++} name={name} {...propsVals} core={core}/>
      </div>
    ) : null
  }
}


if (typeof window != 'undefined') {


  window.onerror = function (errorMsg, url, lineNumber) {
    //window['_setErrors']('error', {[url + ':' + lineNumber]: errorMsg});
    return true;
  };

  window['_formErrors'] = {};
  window['_setErrors'] = function (errName: string, errData: any) {
    window['_formErrors'] = {...window['_formErrors'], [errName]: errData};
    let errorText: string[] = [];
    objKeys(window['_formErrors']).forEach(key => {
      if (window['_formErrors'][key] && objKeys(window['_formErrors'][key]).length) errorText.push(JSON.stringify(window['_formErrors'][key]))
    });
    window['_errorText'] = errorText;
    //window['errorsRef'] && window['errorsRef'].forceUpdate();//.setState({errorText: errorText.join('\n\n')});
    window.top['_setIframeErrors'] && window.top['_setIframeErrors'](window['_formErrors'])
  };

  window['_setForm'] = async function (data: any) {
    let elements: any;
    window['_setErrors']('error', '');

    let dataErrors = {};
    if (getIn(data, 'elements')) {
      if (window['data_elements'] !== data.elements) {
        window['data_elements'] = data.elements;
        window['elements_objects'] = null;
        window['elements_errs'] = null;
      }
      elements = async () => {
        let res = await Promise.all((data.elements.links || []).map(async (lnk: any, lnum: number) => {
            let module: any = {};
            try {
              if (lnk.from.split('.').slice(-1)[0] == 'json') module = await (await fetch(lnk.from)).json();
              else module = await importModule(lnk.from);
            } catch (e) {
              setIn(dataErrors, e.message, 'elements', 'links', lnum);
              return [];
            }

            if (!lnk['import'].length) return [module];
            else return lnk['import'].map((v: string) => {
              if (isUndefined(module[v])) {
                setIn(dataErrors, '"' + v + '" is undefined', 'elements', 'links', lnum);
                return {};
              }
              return module[v]
            })
          }
        ));
        const objs: any[] = [];
        res.forEach(v => push2array(objs, v));
        let code = data.elements.code.trim() || '';
        if (code[0] != '{') code = '{' + code + '}';
        try {
          eval('code=' + code + ';');
        } catch (e) {
          setIn(dataErrors, e.stack, 'elements', 'code');
          code = {}
        }
        objs.push(code);
        return objs

      };
    }
    let schema: any;
    if (getIn(data, 'schema')) schema = async () => {
      let res = await Promise.all((data.schema.links || []).map(async (lnk: any, lnum: number) => {
          let module: any = {};
          try {
            module = await (await fetch(lnk.link)).json();
          } catch (e) {
            setIn(dataErrors, e.stack, 'schema', 'links', lnum, 'link');
          }
          return makeSlice(normalizePath(lnk.path), module);
        }
      ));
      let code = data.schema.code || {};
      return merge.all(code, res);
    };
    if (!elements) return;
    elements = window['elements_objects'] || await elements();
    window['elements_errs'] = window['elements_errs'] || getIn(dataErrors, 'elements');
    window['elements_objects'] = elements;
    setIn(dataErrors, window['elements_errs'], 'elements');
    if (!dataErrors['elements']) delete dataErrors['elements'];
    schema = await schema();
    elements = fformElements.extend(elements);
    while (!window['viewerRef']) await sleep(500);
    window['_viewerData'] = {name: data.name, schema, elements, css: data.css, formProps: data.props};
    window['viewerRef'].forceUpdate(); //setState({name: data.name, schema, objects, css: data.css, formProps: data.props});
    window['errorsRef'] && window['errorsRef'].setState({hasError: false});//.setState({errorText: errorText.join('\n\n')});
    window['_setErrors']('dataErrors', dataErrors)
  };

  const container = document.querySelector('#root');
  render(<div>
    <ErrorBoundary ref={(r) => r && (window['errorsRef'] = r)}>
      <Viewer ref={(r) => r && (window['viewerRef'] = r)}/>
    </ErrorBoundary>
  </div>, container);


}

export {}