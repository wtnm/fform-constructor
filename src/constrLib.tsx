import * as React from "react";
//import {Creatable} from 'react-select';
//const Select = require('react-select').default;

import ReactJson from 'react-json-view'

const Creatable = require('react-select/creatable').default;
import Select from 'react-select';
import {objectDerefer} from 'fform/src/api';
import {
  getIn,
  objKeys,
  isMergeable,
  isUndefined,
  isString
} from 'fform/src/commonLib';
import {types, normalizePath, SymData} from 'fform/src/stateLib';
import {getElements} from './constrView'
import {isFField} from "./constrUtils";


const SymTypes = Symbol.for('FConstrTypes');

function splitSets(elements: any) {
  const isMain = (set: any) => getIn(objectDerefer(elements, set), 'Main', '_$widget');
  const except = ['base', 'null'];
  const res: any = {main: [], addons: []};
  Object.keys(elements.sets).forEach(key => res[(~except.indexOf(key) || isMain(elements.sets[key])) ? 'main' : 'addons'].push(key));
  return res
}


let constrElements = {
  sets: {
    base: {[SymTypes]: []},
    simple: {
      [SymTypes]: [],
      Main: {
        onFocus: {$: '^/fn/focus|^/_usr/unSelectField'}
      }
    },
    null: {[SymTypes]: ['null']},
    string: {[SymTypes]: ['string']},
    number: {[SymTypes]: ['number']},
    integer: {[SymTypes]: ['integer']},
    boolean: {[SymTypes]: ['boolean']},
    object: {
      [SymTypes]: ['array', 'object'],
      Wrapper: {className: {'fform-object-wrapper': true}}
    },
    array: {[SymTypes]: ['array', 'object']},
    textarea: {[SymTypes]: ['string']},
    integerNull: {[SymTypes]: ['integer', 'null']},
    numberNull: {[SymTypes]: ['number', 'null']},
    booleanLeft: {[SymTypes]: ['boolean']},
    booleanNull: {[SymTypes]: ['boolean', 'null']},
    booleanNullLeft: {[SymTypes]: ['boolean', 'null']},
    select: {[SymTypes]: ['string', 'number', 'integer', 'boolean', 'null']},
    multiselect: {[SymTypes]: ['array']},
    radio: {[SymTypes]: ['string', 'number', 'integer', 'boolean', 'null']},
    checkboxes: {[SymTypes]: ['array']},
  },
  _usrSets: {
    reactSelect: {
      $_ref: '^/sets/simple',
      Main: {
        _$useTag: '^/_widgets/ReactCreatable',
        onChange: {$: '^/_usr/reactSelectParse|^/fn/setValue|liveUpdate'},
        $_maps: {
          value: {$: '^/_usr/reactSelectValue', args: ['@/value']},
          options: {$: '^/_usr/reactSelectValue', args: ['@/fData/enum']},
          isDisabled: '@/params/disabled'
        },
      },
    },
    rsMulti: {Main: {isMulti: true}},
    rsStatic: {Main: {_$useTag: '^/_widgets/ReactSelect'}},
    radioDeselect: {Main: {$_maps: {children: {'0': {args: {'3': {onClick: '^/_usr/radioClick'}}}}}}}
  },
  _widgets: {
    ReactSelect: Select,
    ReactCreatable: Creatable,
    ReactJson: ReactJson,
  },
  parts: {
    Button: {
      className: {'fform-shrink': true},
    },
  },
  _parts: {

    expandButton: {
      $_ref: '^/parts/Button',
      children: [],
      $_maps: {'children/0': {$: '^/fn/iif', args: ['@/params/expanded', '➖', '➕']}},
      onClick: {
        $: '^/fn/setValue',
        args: [{$: '^/fn/not', args: '@/params/expanded'}, {path: './@/params/expanded'}],
      }
    },
    emptyArray: {children: ['(no items)'], style: {textAlign: 'center'}, $_maps: {'className/fform-hidden': '@/length'}}
  },
  _usr: {
    // multi(...args: any[]) {
    //   for (let i = 0; i < args.length; i++) isFunction(args[i]) && args[i]()
    // },
    selectField: function (event: any) {
      if (!isString(event.target.className) || !~event.target.className.indexOf('fform-wrapper'))
        return;
      let mainForm = this.pFForm.parent;
      if (mainForm) {
        let fieldSelected = mainForm.api.get('/@/fieldSelected');
        if (fieldSelected) this.api.set(fieldSelected + '@/params/fieldSelected', false);
        let curSelected = this.api.get('./@/params/fieldSelected');
        this.api.set('./@/params/fieldSelected', !curSelected);
        mainForm.api.set('/@/fieldSelected', curSelected ? '' : this.path);
        event.stopPropagation();
      }
    },
    unSelectField() {
      let mainForm = this.pFForm.parent;
      if (mainForm) {
        let fieldSelected = mainForm.api.get('/@/fieldSelected');
        if (fieldSelected) {
          this.api.set(fieldSelected + '@/params/fieldSelected', false);
          mainForm.api.set('/@/fieldSelected', '');
        }
      }
    },
    ifTrue: function (value: any) {
      if (value) return [value];
      else this.api.set(null)
    },
    ifFalse: function (value: any) {
      if (!value) return [value];
      else this.api.set(null)
    },
    radioClick: function (event: any) {
      const value = event.target.value;
      if (this.api.getValue() === value) this.api.setValue('');
    },
    eval: function (value: string) {
      return [eval(value)]
    },
    reactSelectParse: function (values: any) {
      if (values === null) {
        if (this.$branch[SymData].fData.type === 'array') return [[]];
        return null;
      }
      if (!Array.isArray(values)) return values.value;
      return [values.map((item: any) => item.value)]
    },
    reactSelectValue: function (values: any = []) {
      if (!Array.isArray(values)) return values ? [{value: values, label: values}] : [];
      return [values.map((value: string) => {return {value, label: value}})]
    },
    reactSelectPresetOptions: function (values: any, fieldTypes: string[]) {
      const obj = this.pFForm.elements;
      const splitted = splitSets(obj);

      if (!values.length) {
        //let fieldTypes = this.api.get('../../../type@value');
        if (!fieldTypes.length) fieldTypes = types;
        const hasTypes = (types: any) =>
          !types || fieldTypes.every((key) => !!~types.indexOf(key));
        return [splitted['main'].filter((set: string) => hasTypes(obj.sets[set][SymTypes]))];
      }
      return [splitted['addons']].filter(key => !~values.indexOf(key));
    },
    addCombine: function (setOneOf: number) {
      //const enums = this.api.get('../selector/@/fData/enum');
      const val = this.api.get('./selector/@/value');
      if (val) this.api.arrayAdd('./' + val, 1, {setOneOf})
    },
    addCustom: function () {
      const enums = this.api.get('./selector/@/fData/enum');
      const val = this.api.get('./selector/@/value');
      const idx = enums.indexOf(val);
      if (~idx) this.api.arrayAdd('./valueArray/' + idx, 1)
    },
    customDisable: function () {
      //const enums = this.api.get('./selector/@/fData/enum');
      const idx = this.api.get('./selector/@/value');
      //const idx = enums.indexOf(val);
      if (idx !== '') {
        const arrayValue = this.api.getValue({path: './valueArray/' + idx + '/value'});
        if (arrayValue !== 'null' && arrayValue !== 'false' && arrayValue !== '""') {
          this.api.setValue('null', {path: './valueArray/' + idx + '/value'});
          this.api.set('./@/selectorSaved/' + idx, arrayValue, {replace: true})
        } else {
          const saved = this.api.get('./@/selectorSaved/' + idx) || '';
          this.api.setValue(saved, {path: './valueArray/' + idx + '/value'});
          this.api.set('./@/selectorSaved/' + idx, null, {replace: true})
        }

      }
    },
    customIsDisabled: function (value: string, enumExten: any[]) {
      return [value && getIn(enumExten[value], 'className', 'disabled')];
    },
    setMoveOpts: function () {
      const path = normalizePath(this.path);
      const fullValue = this.api.getValue({path: '/'});
      while (path.length && !getIn(fullValue, path, 'fieldProps')) path.pop();
      const fields = (getIn(fullValue, path, 'layout', 'fields') || []);//.filter((v: any) => v.fieldProps);
      const moveOpts = fields.map((v: any, i: number) => v.fieldProps && i + ': ' + (v.name || '(no name)') + ' - [' + (v.type.join(', ') || 'no type') + ']');
      this.api.set('./@/moveOpts', moveOpts.filter((v: any) => v))
    },
    moveFieldIn: function ({value}: any) {
      const path = normalizePath(this.path);
      const fullValue = this.api.getValue({path: '/'});
      while (path.length && !getIn(fullValue, path, 'fieldProps')) path.pop();
      value = value.split(':')[0];
      const field = getIn(fullValue, path, 'layout', 'fields', value);
      this.api.arrayAdd('./fields', [field]);
      this.api.arrayItemOps([path, 'layout', 'fields', value], 'del');
    },
    moveFieldOut: function () {
      const path = normalizePath(this.path);
      const fullValue = this.api.getValue({path: '/'});
      path.pop();
      while (path.length && !getIn(fullValue, path, 'fieldProps')) path.pop();
      const field = this.api.getValue();
      this.api.arrayItemOps('/.', 'del');
      this.api.arrayAdd([path, 'layout', 'fields'], [field])
    },
    oneOfField(value: any) {
      return [isFField(value) ? 0 : 1]
    },
    addBrackets(value: string) {
      if (value[0] !== '{' && value[value.length - 1] !== '}') value = '{' + value + '}';
      return [value]
    },
    jsonStringify: function (v: any, r: any, s: any, ...args: any[]) {
      return [JSON.stringify(v, r, s), ...args];
    },
    reactJsonParse: function (value: any, ...args: any[]) {
      return [value.updated_src, ...args]
    }
  },
  stateMaps: {
    showPropOrItem: function (types: string[]) {
      return [!(types && types.length && !(~types.indexOf('array') && ~types.indexOf('object')))]
    },
    mapPropOrItem: function (types: boolean) {
      return [!types]
    },
    fieldTypesSel: function (types: string[]) {
      const hiddenFields = !(!types.length || ~types.indexOf('object') || ~types.indexOf('array'));
      this.api.setHidden('./layout', hiddenFields);
      this.api.set('./@/params/fieldsAddHidden', hiddenFields);

    },
    jsonPropsSel: function (types: string[] = []) {
      const hidden = types.length ? {array: true, object: true, string: true, number: true} : {array: false, object: false, string: false, number: false}
      types.forEach(type => (type = type == 'integer' ? 'number' : type) && hidden.hasOwnProperty(type) && (hidden[type] = false));
      const result: any = [];
      Object.keys(hidden).forEach(type => this.api.setHidden('./' + type + 'Props', hidden[type]));
    },
    typeObject: function (type: string) {
      let oneOf: any = 0;
      if (type == 'string') oneOf = 0;
      else if (type == 'number') oneOf = 1;
      else if (type == 'booleanNull') oneOf = 2;
      if (typeof oneOf == 'number') this.api.set('./value/@/oneOf', oneOf);
      else this.api.set(null);
    },
    customSelectors: function (preset: string[] = [], fieldTypes: string[] = []) {
      // const result: any = [];
      //const objects = getObjects();
      const elements = getElements();//this.api.props.elements;
      let $_ref = '^/sets/simple';
      // if (!preset.length) {
      //   if (fieldTypes.length == 1) $_ref = '^/sets/' + fieldTypes[0]
      // } else $_ref = preset.map((k: string) => '^/sets/' + k).join(':');
      let a = objKeys(objectDerefer(elements, {$_ref}));
      //const selectors = push2array(['$_parse'], objKeys(objectDerefer(objects, {$_ref}))).sort();
      const selectors = objKeys(objectDerefer(elements, {$_ref})).sort();
      const prevSelectors = this.api.get('./@/value') || [];
      this.api.set('./@/value', selectors);
      this.api.set('../selector/@/fData/enum', selectors.map((v, i) => i.toString()));
      let value = this.api.get('../selector/@/value');
      let enumExten = (this.api.get('../selector/@/fData/enumExten') || []).slice();
      prevSelectors.forEach((v: any, i: number) => {
        if (!enumExten[i]) enumExten[i] = {label: prevSelectors[i], className: {disabled: false, grayed: true}};
        else if (!enumExten[i].label)
          enumExten[i] = {...enumExten[i], label: prevSelectors[i]};
      });
      value = getIn(enumExten[value], 'label') || '';
      for (let i = 0; i < selectors.length; i++) {
        while (enumExten[i] && selectors[i] > enumExten[i].label) {
          enumExten.splice(i, 1);
          this.api.arrayItemOps('../valueArray/' + i, 'del');
        }
        if (!enumExten[i] || selectors[i] < enumExten[i].label) {
          enumExten.splice(i, 0, {label: selectors[i], className: {disabled: false, grayed: true}});
          this.api.arrayAdd('../valueArray', 1);
          const last = enumExten.length - 1;
          if (i !== last) this.api.arrayItemOps('../valueArray/' + (last), 'move', {value: i});
        }
      }
      this.api.set('../selector/@/fData/enumExten', enumExten); // {replace:true};
      let pos = selectors.indexOf(value);
      this.api.set('../selector/@/value', pos == -1 ? '' : a.toString());
    },
    valueArraySel: function (value: string) {
      this.api.set(null);
      // const vals = this.api.get('../selector/@/fData/enum') || [];
      this.api.showOnly('./' + (value || 'none'))
    },
    jsonMap: function (value?: any) {
      let idx = this.from.split('@')[0].split('/');
      idx.pop();
      idx = idx.pop();
      const className: anyObject = {};
      className['disabled'] = !isUndefined(value) && !value; //!isMergeable(value);
      className['grayed'] = !isMergeable(value) || !objKeys(value).length;
      this.api.set(this.to + '/' + idx + '/className', className);
    }
  },
  _validators: {
    testJSON: function (value: any, setPath: string) {
      this.api.set(null);
      if (value === '') {
        if (setPath) this.api.set(setPath, undefined, {replace: true});
        return '';
      }
      try {
        let json = JSON.parse(value);
        if (setPath) this.api.set(setPath, json, {replace: true});
        return ''
      } catch (e) {
        return e.message
      }
    },
    // fn: {
    //
    // },
    Main: {
      "onChange": "^/fn/eventValue|parseNum|setValue",
      "$_maps": {"value": {"$": "^/fn/formatNum", "args": ["@value"]}}
    }
  }
};


export default constrElements;