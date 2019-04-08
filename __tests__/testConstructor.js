process.env.TS_NODE_PROJECT = './tsconfig.json';

// Optional: set env variable to enable `tsconfig-paths` integration
// process.env.TS_CONFIG_PATHS = true;

require('ts-mocha');

const {expect} = require('chai');
const constructorFuncs = require('../src/constrUtils.tsx');

// let formValuesEmpty = {
//   "propOrItem": [],
//   "name": "",
//   "refEnabled": false,
//   "ref": "",
//   "type": [],
//   "fieldProps": {
//     "jsonProps": {
//       "commonProps": {
//         "title": "",
//         "description": "",
//         "default": "",
//         "definitions": []
//       },
//       "stringProps": {
//         "minLength": null,
//         "maxLength": null,
//         "pattern": "",
//         "format": ""
//       },
//       "numberProps": {
//         "multipleOf": null,
//         "maximum": null,
//         "exclusiveMaximum": null,
//         "minimum": null,
//         "exclusiveMinimum": null
//       },
//       "arrayProps": {
//         "additionalItems": "",
//         "additionalItemsField": null,
//         "minItems": null,
//         "maxItems": null,
//         "uniqueItems": null
//       },
//       "objectProps": {
//         "required": [],
//         "minProperties": null,
//         "maxProperties": null,
//         "additionalProperties": "",
//         "additionalPropertiesField": null
//       },
//       "combine": {
//         "selector": "",
//         "allOf": [],
//         "oneOf": [],
//         "anyOf": [],
//         "not": [],
//         "patternProperties": [],
//         "dependencies": []
//       }
//     },
//     "ffProps": {
//       "ff_presets": [],
//       "ff_managed": false,
//       "ff_validators": [],
//       "ff_dataMap": [],
//       "ff_placeholder": "",
//       "ff_params": [],
//       "ff_custom": {
//         "selector": "",
//         "selectorVals": [],
//         "valueArray": []
//       }
//     },
//     "restProps": ""
//   },
//   "layout": {
//     "name": "",
//     "type": "object",
//     "value": "",
//     "fieldsEnabled": true,
//     "valueArray": [],
//     "fields": []
//   }
// };
//

function compareFormValues(formValuesOrig, formValues) {
  expect(formValues.fieldProps.ffProps).to.be.eql(formValuesOrig.fieldProps.ffProps);
  expect(formValues.fieldProps.jsonProps.arrayProps).to.be.eql(formValuesOrig.fieldProps.jsonProps.arrayProps);
  expect(formValues.fieldProps.jsonProps.combine).to.be.eql(formValuesOrig.fieldProps.jsonProps.combine);
  expect(formValues.fieldProps.jsonProps.commonProps).to.be.eql(formValuesOrig.fieldProps.jsonProps.commonProps);
  expect(formValues.fieldProps.jsonProps.numberProps).to.be.eql(formValuesOrig.fieldProps.jsonProps.numberProps);
  expect(formValues.fieldProps.jsonProps.objectProps).to.be.eql(formValuesOrig.fieldProps.jsonProps.objectProps);
  expect(formValues.fieldProps.jsonProps.stringProps).to.be.eql(formValuesOrig.fieldProps.jsonProps.stringProps);
  expect(formValues.fieldProps.jsonProps).to.be.eql(formValuesOrig.fieldProps.jsonProps);
  expect(formValues.fieldProps).to.be.eql(formValuesOrig.fieldProps);
  expect(formValues.layout).to.be.eql(formValuesOrig.layout);
  expect(formValues).to.be.eql(formValuesOrig);
}


const JSONwithValues = {
  "$ref": "ref",
  "type": [
    "number",
    "string",
    "array",
    "object"
  ],
  "multipleOf": 1,
  "maximum": 1,
  "exclusiveMaximum": true,
  "minimum": 1,
  "exclusiveMinimum": true,
  "minLength": 1,
  "maxLength": 1,
  "pattern": "pattern",
  "format": "format",
  "additionalItems": true,
  "minItems": 1,
  "maxItems": 1,
  "uniqueItems": true,
  "required": [
    "test"
  ],
  "minProperties": 1,
  "maxProperties": 1,
  "additionalProperties": true,
  "title": "title",
  "description": "description",
  "default": 0,
  "ff_presets": "test:hidden",
  "ff_managed": true,
  "ff_validators": [
    {
      "$": "v",
      "args": [
        "${value}"
      ]
    }
  ],
  "ff_dataMap": [
    {
      "from": "from",
      "to": "to",
      "$": "fn",
      "args": [
        "${value}",
        {
          "y": "s"
        },
        54,
        null,
        [
          "s"
        ]
      ]
    }
  ],
  "ff_placeholder": "placeholder",
  "ff_params": {
    "autofocus": true,
    "liveValidate": true,
    "readonly": true,
    "disabled": true,
    "hidden": true,
    "norender": true,
    "viewer": true
  },
  "ff_custom": {
    "Builder": {
      "string": "string"
    },
    "Main": {
      "type": "password"
    }

  },
  "enum": [
    1,
    2,
    3
  ],
  "ff_layout": {
    "string": "string"
  }
};


const JSONWithObjects = {
  "definitions": {
    "test": {
      "type": "string",
    }
  },
  "type": [
    "object",
    "array"
  ],
  "ff_layout": {
    "$_fields": [
      "name1",
      {
        "$_fields": [
          "0",
          "1"
        ]
      }
    ]
  },
  "items": [
    {
      "type": "string"
    },
    {
      "type": "boolean"
    }
  ],
  "properties": {
    "0": {
      "type": "string"
    },
    "name1": {
      "type": "number"
    }
  }
};

describe('FForm constructor utilities test', function () {

  // it('test formObj2JSON <=> JSON2formObj', function () {
  //
  // });

  it('test empty JSON formValues2JSON <=> JSON2formValues', function () {
    let formValues = constructorFuncs.JSON2formValues({});
    expect(formValues).to.have.property('fieldProps');
    let JSONvalues = constructorFuncs.formValues2JSON(formValues);
    expect(JSONvalues).to.be.eql({});
    //compareFormValues(formValuesEmpty, formValues);
  });

  it('test JSONwithValues formValues2JSON <=> JSON2formValues', function () {
    let formValues = constructorFuncs.JSON2formValues(JSONwithValues);
    expect(formValues).to.have.property('fieldProps');
    let JSONvalues = constructorFuncs.formValues2JSON(formValues);
    expect(JSONvalues).to.be.eql(JSONwithValues);

  });

  it('test JSONWithObjects formValues2JSON <=> JSON2formValues', function () {
    let formValues = constructorFuncs.JSON2formValues(JSONWithObjects);
    expect(formValues).to.have.property('fieldProps');
    let JSONvalues = constructorFuncs.formValues2JSON(formValues);
    expect(JSONvalues).to.be.eql(JSONWithObjects);
  });

  // it('test formValues2JSON JSON2formValues JSONform2js with formValuesWithFieldsPros', function () {
  //   let JSONform = constructorFuncs.formValues2JSON(formValuesWithFieldsPros);
  //  
  //
  //   let FormValues = constructorFuncs.JSON2formValues(JSONform);
  //  
  //
  // });

});