import FFormSchema from './constrSchema';
import {getIn, merge, push2array, getCreateIn, isObject, isString, isEqual, isArray, deArray, toArray, isUndefined, hasIn, isMergeable} from "fform/src/commonLib";
import {types, normalizePath, objMap, getSchemaPart, path2string} from 'fform/src/stateLib';
//import {paramsEnum} from './constrSchema';
//import {string} from "prop-types";

const objKeys = Object.keys;
const symbolMarker = '#@>';

type formObjectType = {
  "value"?: any,
  fields?: any[]
  fieldsEnabled?: boolean
}

const isFField = (values: any) => values && values.hasOwnProperty('fieldProps');

const stringify = (value: any, ...rest: any[]) => isUndefined(value) ? '' : JSON.stringify(value, ...rest);


// 'string', 'number', 'booleanNull', 'array', 'object'

function formObj2JSON(objectValues: formObjectType, UPDATABLE: any = {}, track: Path = []): any {
  let result: any;
  try {
    result = objectValues.value === '' ? undefined : JSON.parse(objectValues.value)
  } catch (e) {
    //e.message = e.message + ', in path: ' + track.join('/');
    UPDATABLE.errors.push(path2string(track) + e.message);
    return undefined
  }
  if (objectValues.fieldsEnabled && (UPDATABLE.isArray || UPDATABLE.isObject)) {
    if (!isMergeable(result)) result = {};
    const $_fields: any[] = [];
    const {fields = []} = objectValues;
    fields.forEach(field => {
      if (isFField(field)) {

        const arrayItem = (UPDATABLE.isArray && UPDATABLE.isObject && ~field.propOrItem.indexOf('item')) || (UPDATABLE.isArray && !UPDATABLE.isObject);
        const objectProp = (UPDATABLE.isArray && UPDATABLE.isObject && ~field.propOrItem.indexOf('property')) || (!UPDATABLE.isArray && UPDATABLE.isObject);
        const fieldName = arrayItem ? (UPDATABLE.counter++).toString() : objectProp && field.name;

        if (fieldName) {
          let fieldJson = formValues2JSON(field, track.concat(fieldName), UPDATABLE.errors);
          if (arrayItem) UPDATABLE.items.push(fieldJson);
          if (objectProp) UPDATABLE.properties[fieldName] = fieldJson;
          $_fields.push(fieldName)
        }
      } else $_fields.push(formObj2JSON(field, UPDATABLE, track.concat($_fields.length))); // '@field_' +
    });
    result.$_fields = $_fields;
  }
  return result;
}

// function JSONObj2js(JSONValues: any): string {
//   let result: any = [];
//   let valueType = typeof JSONValues;
//   switch (valueType) {
//     case 'object':
//       if (JSONValues.hasOwnProperty(symbolMarker + 'unescaped')) {
//         result = JSONValues[symbolMarker + 'unescaped'];
//         return (typeof result == 'string') ? result : JSON.stringify(result);
//       } else {
//         if (Array.isArray(JSONValues)) {
//           return '[' + JSONValues.map(item => JSONObj2js(item)).join(',') + ']';
//         } else {
//           let obj2merge = [];
//           objKeys(JSONValues).forEach(key => {
//             if (key == symbolMarker + 'external') obj2merge = Array.isArray(JSONValues[key]) ? JSONValues[key] : [JSONValues[key]];
//             else result.push('"' + key + '":' + JSONObj2js(JSONValues[key]))
//           });
//           if (result.length) obj2merge.push('{' + result.join(',') + '}');
//           if (!obj2merge.length) return '{}';
//           if (obj2merge.length == 1) return obj2merge[0];
//           return 'merge.all(' + obj2merge[0] + ',[' + obj2merge.slice(1).join(',') + '])';
//         }
//       }
//     default:
//       return JSON.stringify(JSONValues);
//   }
// }


function JSON2formObj(JSONValues: any, UPDATABLE?: any): formObjectType {
  let result: formObjectType;
  if (isObject(JSONValues)) {
    const {$_fields, ...rest} = JSONValues;
    result = {value: objKeys(rest).length ? stringify(rest) : ''};
    if ($_fields) {
      result.fieldsEnabled = true;
      let fields: any[] = [];
      ($_fields || []).forEach((f: any) => {
        if (isObject(f)) fields.push(JSON2formObj(f, UPDATABLE));
        if (isString(f)) {
          let resA, resO;

          if (getIn(UPDATABLE, 'items', f)) resA = JSON2formValues(UPDATABLE.items[f]);

          if (getIn(UPDATABLE, 'properties', f)) resO = JSON2formValues(UPDATABLE.properties[f], f);

          if (resA && resO) {
            resA.propOrItem = ['property', 'item'];
            fields.push(resA);
            if (!isEqual(UPDATABLE.items[f], UPDATABLE.properties[f], {deep: true}))
              throw new Error('Different fields with sane name');
            delete UPDATABLE.items[f];
            delete UPDATABLE.properties[f];
          } else if (resA) {
            resA.propOrItem = ['item'];
            fields.push(resA);
            delete UPDATABLE.items[f];
          } else if (resO) {
            resO.propOrItem = ['property'];
            fields.push(resO);
            delete UPDATABLE.properties[f];
          }
        }
      });
      result.fields = fields
    }
  } else {result = {value: stringify(JSONValues)};}

  return result;
}


function formValues2JSON(formValues: any, track: Path = [], errors: string[] = []): any {

  function mapFields(fields: any[], fn: Function) {
    let res = {};
    fields.forEach((field: any, i) => (i = field.name || i.toString()) && (res[i] = fn(field, i)));
    return res
  }

  let result: any = {};

  if (formValues.refEnabled && formValues.ref) result.$ref = formValues.ref;

  result.type = deArray(formValues.type);
  const jsonProps = getIn(formValues, 'fieldProps', 'jsonProps') || {};
  (formValues.type && formValues.type.length ? formValues.type : types).forEach((tp: string) => {
    tp = (tp == 'integer' ? 'number' : tp) + 'Props';
    const sProps = getIn(jsonProps, tp);
    objKeys(sProps || {}).forEach(key => result[key] = sProps[key]);
  });

  // const commonProps = jsonProps['commonProps'] || {};
  let {combine = {}, commonProps = {}} = jsonProps;
  Object.assign(result, commonProps);
  combine = {...combine};
  delete combine.selector;
  Object.assign(result, combine);


  if (hasIn(result, 'default') && result['default'] !== '') {
    try {
      result['default'] = JSON.parse(result['default']);
    } catch (e) {
      delete result['default'];
      errors.push(path2string(track) + '/@default: ' + e.message);
    }
  } else delete result['default'];


  ['additionalItems', 'additionalProperties'].forEach(f => {
      result[f] = result[f] == 'field' ? formValues2JSON(result[f + 'Field'], track.concat('@' + f + 'Field'), errors) : JSON.parse(result[f] || 'null');
      delete result[f + 'Field']
    }
  );

  if (getIn(result, 'dependencies', 'length'))
    result['dependencies'] = mapFields(result['dependencies'], (f: any, name: string) => isFField(f) ?
      formValues2JSON(f, track.concat(['@dependencies', name]), errors) : f.values);

  ['patternProperties', 'definitions'].forEach(k => getIn(result, k, 'length') &&
    (result[k] = mapFields(result[k], (f: any, n: string) => formValues2JSON(f, track.concat(['@' + k, n]), errors))));
  ['allOf', 'oneOf', 'anyOf'].forEach(k => result[k] && result[k].length &&
    (result[k] = result[k].map((f: any, n: string) => formValues2JSON(f, track.concat(['@' + k, n]), errors))));
  if (result.not && result.not.length) result.not = formValues2JSON(result.not[0], track.concat(['@not']), errors);
  else delete result.not;


  let ffProps = getIn(formValues, 'fieldProps', 'ffProps') || {};
  objKeys(ffProps).forEach(key => {
    if (key == '_custom') {
      const {_custom = {}} = ffProps;
      const res = {};
      _custom.selectorVals.forEach((block: string, i: number) => {
        let b = formObj2JSON(_custom.valueArray[i], {errors});
        if (isMergeable(b) && objKeys(b).length) res[block] = b;
        else if (!isUndefined(b) && !b) res[block] = b
      });
      result[key] = res;
    } else if (key == '_params') {
      const res = {};
      (ffProps[key] || []).forEach((k: string) => {
        if (k[0] == '!') res[k.substr(1)] = false;
        else res[k] = true;
      });
      result[key] = res;
      // if (result['_params']) return;
      // const {params = {}, ...data} = formObj2JSON({type: 'object', valueArray: ffProps[key]}) || {};
      // if (objKeys(data).length) result['_data'] = data;
      // (ffProps['_params'] || []).forEach((p: string) => params[p] = true);
      // if (objKeys(params).length) result['_params'] = params
    } else if (key == '_simple') {
      if (ffProps[key]) result[key] = ffProps[key]
    } else if (key == '_presets') {
      result[key] = ffProps[key].join(':')
    } else if (key == '_validators') {
      if (ffProps[key].length)
        result[key] = ffProps[key].map((v: any[]) => {
          const args = v.slice(1).map(f => formObj2JSON(f, {errors}));
          const res = {$: v[0], args};
          objKeys(v).filter(k => isNaN(parseInt(k))).forEach(k => res[k] = v[k]);
          return res
        })
    } else if (key == '_stateMaps') {
      if (ffProps[key].length)
        result[key] = ffProps[key].map((v: any[]) => {
          const args = v.slice(3).map(f => formObj2JSON(f, {errors}));
          const res: any = {from: v[0], to: v[1]};
          if (v[2]) {
            res.$ = v[2];
            if (args.length) res.args = args
          }
          objKeys(v).filter(k => isNaN(parseInt(k))).forEach(k => res[k] = v[k]);
          return res
        })
    } else result[key] = ffProps[key];
  });


  let restProps = (getIn(formValues, 'fieldProps', 'restProps', 'value') || '{}').trim();
  if (restProps[0] !== '{' && restProps[restProps.length - 1] !== '}') restProps = '{' + restProps + '}';
  try {
    restProps = JSON.parse(restProps);
  } catch (e) {
    errors.push(path2string(track) + '@/rest: ' + e.message);
    restProps = {};
  }
  result = merge(result, restProps);

  const isArray = !formValues.type.length || ~formValues.type.indexOf('array');
  const isObject = !formValues.type.length || ~formValues.type.indexOf('object');


  if (isArray || isObject) {
    const items: any[] = [];
    const properties: any = {};
    let {layout} = formValues;
    result['_layout'] = formObj2JSON(layout, {counter: 0, items, properties, isArray, isObject, errors}, track);
    if (result['_layout'].$_fields && !result['_layout'].$_fields.length) delete result['_layout'].$_fields;
    if (items.length == 1 && result.additionalItems === null)
      result['items'] = items[0];
    else result['items'] = items;
    result['properties'] = properties;
  }


  if (!result['title']) delete result['title'];
  if (!result['description']) delete result['description'];
  ['title', 'description', 'pattern', 'format', '_presets', '_placeholder']
    .forEach(key => (result.hasOwnProperty(key) && result[key] === '') && delete result[key]);

  ['required', 'allOf', 'oneOf', 'anyOf', '_validators', '_stateMaps', 'type']
    .forEach(key => (result[key] && !result[key].length) && delete result[key]);

  ['_layout', '_custom', '_data', '_params', 'items', 'properties', 'definitions', 'patternProperties', 'dependencies']
    .forEach(key => (result[key] && !objKeys(result[key]).length) && delete result[key]);

  ['minLength', 'maxLength', 'multipleOf', 'maximum', 'exclusiveMaximum', 'minimum', 'exclusiveMinimum', 'minItems', 'maxItems', 'uniqueItems',
    'minProperties', 'maxProperties', 'additionalItems', 'additionalProperties', '', '', '', '', '']
    .forEach(key => (result.hasOwnProperty(key) && result[key] === null) && delete result[key]);

  ['exclusiveMaximum', 'exclusiveMinimum', 'uniqueItems', 'additionalProperties', '']
    .forEach(key => (result.hasOwnProperty(key) && result[key] === false) && delete result[key]);
  return result;
}


function JSON2formValues(JSONValues: any, name?: string): any {

  const getSchema = (path: string[]) => getSchemaPart(FFormSchema as any, path, () => {return {oneOf: 1}});
  const getValue = (key: string, path: string[]) => (isUndefined(JSONValues[key]) ? getDefault(getSchema(path)) : JSONValues[key]);
  const getDefault = (src: any) => hasIn(src, 'default') ? src.default : types.empty[src.type ? toArray(src.type)[0] : 'any'];

  const mapProps = (dst: any, path: string[], fns: { [key: string]: Function }, keyFn?: Function) =>
    objKeys(getSchema(path).properties || {})
      .forEach(key => {
        delete restProps[key];
        dst[keyFn ? keyFn(key) : key] = fns[key] ?
          fns[key](JSONValues[key], dst, key) :
          getValue(key, path.concat(key))
      });

  const setAdditional = (v: any, dst: any, key: string) => {
    if (isObject(v)) {
      (dst[key + 'Field']) = JSON2formValues(v);
      return 'field'
    }
    dst[key + 'Field'] = null;
    return (isUndefined(v) ? '' : JSON.stringify(v));
  };

  //const tmp: any = {};
  //objKeys(JSONValues).forEach(key => tmp[key.substr(0, 1) == '_' ? key.substr(3) : key] = JSONValues[key]);
  //JSONValues = tmp;

  let result: any = {};
  let jsonProps: any = {};
  let ffProps: any = {};
  let restProps = {...JSONValues};
  result.name = name || '';
  result.ref = JSONValues.$ref || '';
  result.refEnabled = !!JSONValues.$ref;
  result.type = JSONValues.type ? toArray(JSONValues.type) : [];
  result.propOrItem = JSONValues.propOrItem || [];

  let JSONPropsSchema = getSchema(['fieldProps', 'jsonProps']);
  objKeys(JSONPropsSchema.properties || {}).forEach(key => (jsonProps[key] = {}) && mapProps(jsonProps[key],
    ['fieldProps', 'jsonProps', key],
    {
      'default': (v: any, dst: any) => isUndefined(v) ? '' : JSON.stringify(v),
      'additionalItems': setAdditional,
      'additionalProperties': setAdditional,
      'additionalItemsField': (v: any, dst: any) => dst['additionalItemsField'],
      'additionalPropertiesField': (v: any, dst: any) => dst['additionalPropertiesField'],
      'dependencies': (v: any, dst: any) => objKeys(v || {}).map(f => isArray(v[f]) ? {name: f, values: v[f]} : JSON2formValues(v[f], f)),
      'definitions': (v: any) => objKeys(v || {}).map(f => JSON2formValues(v[f], f)),
      'patternProperties': (v: any) => objKeys(v || {}).map(f => JSON2formValues(v[f], f)),
      'allOf': (v: any) => (v || []).map((f: any) => JSON2formValues(f)),
      'oneOf': (v: any) => (v || []).map((f: any) => JSON2formValues(f)),
      'anyOf': (v: any) => (v || []).map((f: any) => JSON2formValues(f)),
      'not': (v: any) => (v && [JSON2formValues(v)]) || [],
    }));


  //let ffPropsSchema = getSchema(['fieldProps', 'ffProps']); // getIn(FFormSchema, normalizePath('definitions/field/properties/fieldProps/oneOf/1/properties/ffProps/properties')) || {};// fieldPropsSchema.properties.ffProps.properties;

  mapProps(ffProps, ['fieldProps', 'ffProps'], {
      '_custom': (v: any) => {
        const res: any = {selector: '', selectorVals: [], valueArray: []};
        objKeys(v || {}).forEach((f: string) => {
          res.selectorVals.push(f);
          res.valueArray.push(JSON2formObj(v[f]));
          //res.valueArray.push(v[f] && objKeys(v[f]).map(name => JSON2formObj(v[f][name], name)));
//          res.valueArray.push(JSON2formObj(v[f]));
        });
        return res;
      },
      '_presets': (v: string = '') => v && isString(v) ? v.split(':') : [],
      '_params': (v: any = {}) => objKeys(v).map(k => (v[k] ? '' : '!') + k),
      '_stateMaps': (v: any = []) => v.map((f: any = {}) => {
        const {from = '', to = '', $ = '', args = [], ...rest} = f;
        const res = [from, to, $, ...args.map((v: any) => JSON2formObj(v))];
        Object.assign(res, rest);
        return res
        //return [f.from || '', f.to || '', f.$ || '', ...(f.args.map((v: any) => JSON2formObj(v)) || [])]
      }),
      '_validators': (v: any = []) => v.map((f: any = {}) => {
        const {$ = '', args, ...rest} = f;
        const res = [$, ...(args.map((v: any) => JSON2formObj(v)) || [])];
        Object.assign(res, rest);
        return res
      }),
    },// (k: string) => k.substr(3)
  );

  if (ffProps.restProps) {
    restProps = merge(restProps, ffProps.restProps);
    delete ffProps.restProps;
  }
  delete restProps.$ref;
  delete restProps._layout;
  delete restProps.type;
  delete restProps.items;
  delete restProps.properties;

  restProps = JSON2formObj(objKeys(restProps).length ? restProps : undefined);

  const UPDATABLE = {items: toArray(JSONValues.items || []).slice(), properties: {...JSONValues.properties}};

  const _layout = isArray(JSONValues['_layout']) ? {$_fields: JSONValues['_layout']} : (JSONValues['_layout'] || {});
  result.layout = JSON2formObj({$_fields: [], ...(_layout)}, UPDATABLE);
  objKeys(UPDATABLE.items).forEach(key => result.layout.fields.push(JSON2formValues(UPDATABLE.items[key])));
  objKeys(UPDATABLE.properties).forEach(key => result.layout.fields.push(JSON2formValues(UPDATABLE.properties[key], key)));

  result.fieldProps = {jsonProps, ffProps, restProps};
  return result;
}


// function JSONform2js(JSONValues: any) {
//   function makeJSFields(xFields: any) {
//     let fields: string[] = [];
//     xFields.forEach((xField: any, pos: any) => {
//       if (typeof xField == 'string') {
//         fields.push('"' + xField + '"');
//       } else if (typeof xField == 'object') {
//         if (xField.hasOwnProperty('fields')) {
//           let xObj: any = {};
//           //let groupObj: string[] = [];
//           Object.assign(xObj, xField);
//           xObj['fields'] = {};
//           xObj['fields'][symbolMarker + 'unescaped'] = makeJSFields(xField['fields']);
//           fields.push(JSONObj2js(xObj))
//         } else fields.push(JSONObj2js(xField))
//       } else {
//         throw new Error('Unknow field at index "' + pos + '"');
//       }
//     });
//     return '[' + fields.join(',') + ']';
//   }
//
//   let result: string[] = [];
//   objKeys(JSONValues).forEach((key => {
//     if (key != 'x') result.push('"' + key + '":' + JSON.stringify(JSONValues[key]))
//   }));
//   let xProps = JSONValues.x || {};
//   let xResult: string[] = [];
//   objKeys(xProps).forEach((xkey => {
//     if (xkey == 'custom') {
//       let xCustom = xProps['custom'] || {};
//       let xCustomResult: string[] = [];
//       objKeys(xCustom).forEach(key => xCustomResult.push('"' + key + '":' + (key !== 'presets' && key !== 'blocks') ? JSONObj2js(xCustom[key]) : JSON.stringify(xCustom[key])));
//       xResult['custom'] = 'custom:{' + xCustomResult.join(',') + '}';
//     } else if (xkey == 'dataMap') {
//       let dataMapResult = xProps['dataMap'].map((dmObj: any) => '[' + JSON.stringify(dmObj[0]) + ',' + JSON.stringify(dmObj[1]) + (dmObj[2] ? ',' + dmObj[2] : '') + ']');
//       xResult.push('"dataMap":[' + dataMapResult.join(',') + ']');
//     } else if (xkey == 'fields') {
//       xResult.push('"$fields":' + makeJSFields(xProps['fields']))
//
//     } else if (xkey == 'validators') {
//       xResult.push('"validators": [' + xProps['validators'].join(',') + ']')
//
//     } else xResult.push('"' + xkey + '":' + JSON.stringify(xProps[xkey]))
//   }));
//   result.push('x:{' + xResult.join(',') + '}');
//   return '{' + result.join(',') + '}'
// }

export {formObj2JSON, JSON2formObj, formValues2JSON, JSON2formValues, symbolMarker, isFField}