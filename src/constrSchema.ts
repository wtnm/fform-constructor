// import {constrElements} from "./FFEditor";


import {types as jsonTypes} from 'fform/src/stateLib';
import * as React from "react";

const paramsEnum = ['autofocus', 'liveUpdate', 'liveValidate', 'readonly', 'disabled', 'hidden', 'norender', 'viewer'];


const FFormSchema: JsonSchema = {
  definitions: {
    tristateNoPadding: {
      allOf: [{$ref: '#/definitions/tristate'},
        {ff_custom: {Wrapper: {className: {'no-side-padding': true}}},}
      ]
    },
    tristate: {
      type: ["null", "boolean"],
      ff_presets: 'booleanNullLeft:inlineTitle:shrink',
      ff_custom: {Main: {className: {'radio-container': true}}},
    },
    arg: {
      allOf: [
        {$ref: '#/definitions/jsonEditor'},
        {
          ff_layout: {
            className: {'field-bg': true},
            $_fields: {0: {$_fields: {0: {$_fields: {5: {buttons: ['del'], style: {marginLeft: '-0.5em'}}}}}}}
          },
          ff_custom: {Wrapper: {className: {'object-arg': true}}},
          properties: {
            //name: {ff_params: {norender: true}},
            value: {ff_custom: {Wrapper: {style: {marginLeft: '-0.9em'}}}}
          }
        }]
    },
    reactSelectStatic: {
      type: 'array',
      ff_managed: true,
      ff_presets: '^/_usrSets/reactSelect:^/_usrSets/rsStatic:^/_usrSets/rsMulti:inlineArrayControls:arrayControls3but',
      ff_placeholder: 'Select values,,,'
    },
    reactSelectArray: {
      type: 'array',
      ff_managed: true,
      ff_presets: '^/_usrSets/reactSelect:^/_usrSets/rsMulti:inlineArrayControls:arrayControls3but',
      ff_placeholder: 'Enter values,,,'
    },
    combineArray: {
      type: "array",
      ff_presets: 'array:noTitle',
      ff_dataMap: [{from: '../selector/@/value', to: './@/params/hidden', $: '^/fn/equal|^/fn/not', args: ['${0}', '']}],
      ff_layout: ['^/_parts/emptyArray'],
      items: {
        oneOf:
          [{$ref: '#/definitions/fieldTop'}]
      }
    },
    fieldTop: {
      allOf: [{$ref: '#/definitions/field'},
        {
          properties: {
            propOrItem: {ff_params: {norender: true}},
          },
          ff_params: {showMoveOut: false},
        }
      ]
    },
    layoutTop: {
      allOf: [
        {$ref: '#/definitions/layout'},
        {
          ff_params: {hideExternal: true},
          ff_dataMap: [
            {from: '../type@value', to: './@/params/propOrItemShown', $: '^/_dataMaps/showPropOrItem'},
            {from: '../@params/expanded', to: './@/params/hideTopLine', $: '^/fn/not'}
          ],
          properties: {
            fieldsEnabled: {ff_params: {norender: true}, default: true},
            value: {title: 'Layout:'}
          },
          ff_layout: {
            $_fields: {
              0: {
                className: {'ff-layout': true},
                $_fields: {
                  0: {
                    $_fields: {
                      2: false, 3: false
                    }
                  }
                }
              }
            }
          }
        }
      ]
    },
    layout: {
      allOf: [{$ref: '#/definitions/jsonEditor'},
        {
          ff_params: {hideExternal: false},
          ff_dataMap: [{from: '../../@/params/propOrItemShown', to: './@/params/propOrItemShown'}],
          properties: {
            // type: {ff_params: {norender: true}, default: 'object'},
            // name: {ff_params: {norender: true}},
            fieldsEnabled: {
              type: 'boolean',
              title: '$_fields',
              ff_presets: 'booleanLeft:shrink',
              ff_custom: {Main: {className: {'radio-container': true}}},
              ff_dataMap: [
                {from: './@/value', to: '../@/params/fieldsShown'},
                {from: './@/value', to: '../fields/@/params/hidden', $: '^/fn/not'}

              ],
            },
            fields: {
              type: 'array',
              ff_presets: 'array:noTitle',
              //ff_custom: {Main: {LayoutDefaultClass: {block: true}}},
              items: {
                ff_oneOfSelector: '^/_usr/oneOfField',
                oneOf: [
                  {
                    allOf: [{$ref: '#/definitions/field'}, {
                      ff_layout: {className: {'field-bg': true}},
                      ff_params: {showMoveOut: true},
                    }]
                  },
                  {
                    allOf: [{$ref: '#/definitions/layout'},
                      {
                        ff_layout: {className: {'object-bg': true}},
                      }]
                  }
                ]
              }

            }
          }
        }]
    },
    jsonEditor: {
      type: "object",
      ff_presets: 'object:noArrayControls',
      // ff_custom: {Wrapper: {className: {'object-prop': true}}},
      ff_data: {moveOpts: [], json: {}},
      ff_params: {hideTopLine: false},
      ff_layout: {
        $_fields: [
          {
            $_maps: {'className/hidden': '@/params/hideTopLine'},
            $_fields: [
              {
                className: {inline: true},
                $_fields: [
                  {
                    $_ref: '^/_parts/expandButton',
                  },
                  'value',
                  {
                    "$_ref": "^/parts/ArrayAddButton",
                    "children": ["+field"],
                    onClick: {args: {1: "./fields", 3: {"setOneOf": 0}}},
                    style: {marginRight: '-1px'},
                    $_maps: {
                      'className/hidden': '!@/params/fieldsShown',
                      disabled: false
                    }
                  },
                  {
                    "$_ref": "^/parts/ArrayAddButton",
                    "children": ["+object"],
                    onClick: {args: {1: "./fields", 3: {"setOneOf": 1}}},
                    $_maps: {
                      'className/hidden': '!@/params/fieldsShown',
                      disabled: false
                    }
                  },
                  'fieldsEnabled',
                  {
                    $_ref: '^/parts/ArrayItemMenu',
                    buttons: ['up', 'down', 'del'],
                    style: {marginLeft: '0.5em'}
                  }
                ]
              },
              {
                $_fields: [
                  {
                    _$widget: '^/_widgets/ReactJson',
                    name: null,
                    onAdd: {$: '^/_usr/reactJsonParse|jsonStringify|^/fn/setValue', args: ['${0}', null, null, {path: './value'}]},
                    onEdit: {$: '^/_usr/reactJsonParse|jsonStringify|^/fn/setValue', args: ['${0}', null, null, {path: './value'}]},
                    onDelete: {$: '^/_usr/reactJsonParse|jsonStringify|^/fn/setValue', args: ['${0}', null, null, {path: './value'}]},
                    $_maps: {
                      src: '@/json'
                    }
                  }
                ],
                $_maps: {'className/hidden': '!@/params/expanded'}
              }
            ]
          }
        ]
      },
      properties: {
        value: {
          type: "string",
          ff_placeholder: 'Enter JSON value...',
          ff_presets: 'string:expand:inlineTitle',
          ff_validators: [{$: '^/_validators/testJSON', args: ['${0}', '../@/json']}],
        },
      }
    },
    objectTop: {
      allOf: [
        {$ref: '#/definitions/object'},
        {ff_custom: {Wrapper: {className: {'object-prop': false}}}}]
    },
    field: {
      type: "object",
      ff_presets: 'object:noArrayControls',
      ff_custom: {
        Wrapper: {
          onClick: '^/_usr/selectField',
          $_maps: {'className/field-selected': '@/params/fieldSelected'}
        }
      },
      ff_layout: {
        className: {layout: true, block: true},
        // ff_params: {showMoveOut: false},
        $_fields: [{
          className: {inline: true, layout: true},
          $_fields: [
            {
              $_ref: '^/_parts/expandButton',
              onMouseEnter: {$: '^/fn/setValue', args: [1, {path: './fieldProps/@/oneOf'}]},
            },
            'propOrItem',
            'name',
            {
              "$_ref": "^/parts/ArrayAddButton",
              "children": ["+field"],
              onClick: {args: {1: "./layout/fields", 3: {"setOneOf": 0}}},// ["./layout/fields", 1, {"setOneOf": 0}]},
              style: {marginRight: '-1px'},
              $_maps: {
                'className/hidden': '@/params/fieldsAddHidden',
                disabled: false
              }
            },
            {
              "$_ref": "^/parts/ArrayAddButton",
              "children": ["+object"],
              onClick: {args: {1: "./layout/fields", 3: {"setOneOf": 1}}},//["./layout/fields", 1, {"setOneOf": 1}]},
              $_maps: {
                'className/hidden': '@/params/fieldsAddHidden',
                disabled: false
              }
            },
            'refEnabled',
            'ref',
            'type',
            //'^/parts/topMoveButton',
            // {
            //   "$_ref": "^/parts/Button",
            //   "children": ["↰"],
            //   onClick: "^/_usr/moveFieldOut",
            //   style: {marginRight: '0.5em', marginLeft: '0.5em'},
            //   $_maps: {
            //     'className/hidden': {$: '^/fn/not', args: '@/params/showMoveOut'},
            //     disabled: false
            //   }
            // },
            {
              buttons: ['up', 'down', 'del'],
              $_ref: '^/parts/ArrayItemMenu',
              style: {marginLeft: '0.5em'}
            }
          ]
        }]
      },
      ff_dataMap: [{from: './@/params/expanded', to: './fieldProps/@/params/hidden', $: '^/fn/not'}],
      // expanded:true
      properties: {
        propOrItem: {
          type: 'array',
          ff_data: {fData: {enum: ['property', 'item']}},
          default: ['property'],
          ff_presets: 'checkboxes:inlineItems:inlineTitle:shrink',
          ff_managed: true,
          items: {type: 'string'},
          ff_dataMap: [{from: '../../../@/params/propOrItemShown', to: './@/params/hidden', $: '^/_dataMaps/mapPropOrItem'}]
        },
        name: {
          type: "string",
          ff_presets: 'string',
          ff_placeholder: 'Enter field name...',
          ff_custom: {Main: {className: {bold: true}}}
          // ff_params: {hidden: false},
        },
        refEnabled: {
          type: 'boolean',
          title: '$ref',
          ff_presets: 'booleanLeft:shrink',
          ff_custom: {Main: {className: {'radio-container': true}}},
          ff_dataMap: [
            {from: './@/value', to: '../ref/@/params/hidden', $: '^/fn/not'},
            {from: './@/value', to: '../type/@/params/hidden'}
          ],

        },
        ref: {
          type: 'string',
          ff_placeholder: '',
          ff_presets: 'string:inlineTitle'
        },
        type: {
          allOf: [{$ref: '#/definitions/reactSelectStatic'},
            {
              //type: "array",
              //'default': [],
              //ff_presets: 'checkboxes:inlineItems:inlineTitle:shrink',
              //ff_managed: true,
              ff_data: {fData: {enum: jsonTypes}},
              items: {"type": "string", enum: jsonTypes},
              ff_dataMap: [{from: './@/value', to: '../', $: '^/_dataMaps/fieldTypesSel'}],
              ff_placeholder: 'Select type,,,'
            }
          ],
        },
        fieldProps: {
          type: 'object',
          oneOf: [
            {ff_managed: true},
            {
              type: "object",
              ff_managed: false,
              ff_layout: {className: {'field-properties': true}},
              properties: {
                jsonProps: {
                  title: 'JSON Schema properties:',
                  type: "object",
                  ff_dataMap: [{from: '../../type/@/value', to: './', $: '^/_dataMaps/jsonPropsSel'}],
                  properties: {
                    commonProps: {
                      type: "object",
                      ff_presets: 'object:noTitle',
                      ff_layout: [{
                        className: {inline: true},
                        $_fields: ['title', 'description', 'defaultUnescaped', 'default',
                          {
                            "$_ref": "^/parts/ArrayAddButton",
                            "children": ["+definition"],
                            onClick: {args: {1: "./definitions", 3: {"setOneOf": 0}}},//["./definitions", 1, {"setOneOf": 0}]},
                            $_maps: {
                              'className/hidden': false,
                              disabled: false
                            }
                          },]
                      }],
                      properties: {
                        title: {
                          type: "string",
                          title: 'Title',
                          ff_placeholder: 'Title...',
                          ff_presets: 'string:noTitle',
                        },
                        description: {
                          type: "string",
                          title: 'Description',
                          ff_placeholder: 'Description...',
                          ff_presets: 'string:noTitle:expand'
                        },
                        // defaultUnescaped: {
                        //   type: 'boolean',
                        //   title: 'Default',
                        //   ff_presets: 'booleanLeft:shrink',
                        //   ff_custom: {Main: {className: {'radio-container': true, unescaped: true}, style: {marginRight: '-1.1em'}}},
                        // },
                        'default': {
                          type: "string",
                          title: 'Default',
                          //ff_placeholder: 'Enter default...',
                          ff_presets: 'string:inlineTitle',
                          ff_validators: ['^/_validators/testJSON'],
                        },
                        definitions: {
                          title: 'Definitions',
                          "type": "array",
                          ff_presets: 'array:noTitle',
                          items: {
                            $ref: '#/definitions/fieldTop'
                          }
                        }
                      }
                    },
                    stringProps: {
                      type: "object",
                      ff_presets: 'object:inlineLayout:noTitle',
                      ff_layout: ['minLength', 'maxLength', 'format', 'pattern'],
                      properties: {
                        minLength: {
                          title: 'Length: min',
                          type: ['null', 'integer'],
                          minimum: 0,
                          ff_presets: 'integerNull:inlineTitle:autowidth'
                        },
                        maxLength: {
                          title: 'max',
                          type: ['null', 'integer'],
                          minimum: 0,
                          ff_presets: 'integerNull:inlineTitle:autowidth'
                        },
                        pattern: {title: 'Pattern', type: "string", ff_presets: 'string:inlineTitle:expand',},
                        format: {
                          title: 'Format',
                          type: "string",
                          'enum': ['', 'date-time', 'date', 'time', 'email', 'ipv4', 'ipv6', 'uri', 'color', 'hostname', 'phone', 'utc-millisec', 'alpha', 'alphanumeric'],
                          ff_enumExten: {'': {label: 'select format...'}},
                          ff_presets: 'select:inlineTitle'
                        }
                      }
                    },
                    numberProps: {
                      type: "object",
                      ff_presets: 'object:inlineLayout:noTitle',
                      ff_layout: ['multipleOf', 'minimum', 'exclusiveMinimum', 'maximum', 'exclusiveMaximum', {$_ref: '^/parts/Expander'}],
                      properties: {
                        multipleOf: {
                          title: 'Multiple of',
                          type: ["null", "number"],
                          minimum: 0,
                          exclusiveMinimum: true,
                          ff_presets: 'numberNull:inlineTitle:autowidth'
                        },
                        maximum: {
                          title: 'max',
                          type: ["null", "number"],
                          ff_presets: 'numberNull:inlineTitle:autowidth'
                        },
                        exclusiveMaximum: {
                          allOf: [
                            {$ref: '#/definitions/tristate'},
                            {title: 'Exclusive max'},
                          ]
                        },
                        minimum: {
                          title: 'min',
                          type: ["null", "number"],
                          ff_presets: 'numberNull:inlineTitle:autowidth'
                        },
                        exclusiveMinimum: {
                          allOf: [
                            {$ref: '#/definitions/tristate'},
                            {
                              title: 'Exclusive min',
                              ff_custom: {Main: {style: {marginRight: '1.0em'}}},
                            },
                          ]
                        },
                      }
                    },
                    arrayProps: {
                      type: "object",
                      ff_presets: 'object:noTitle',
                      ff_layout: [{
                        className: {inline: true},
                        $_fields: ['additionalItems', 'minItems', 'maxItems', 'uniqueItems', {$_ref: '^/parts/Expander'}]
                      }],
                      // ff_params: {hidden: true},
                      properties: {
                        additionalItems: {
                          title: 'Items: additional',
                          type: "string",
                          'default': '',
                          ff_data: {fData: {'enum': ['false', 'true', 'field']}},
                          // ff_enumExten: {'0': {label: 'false'}, '1': {label: 'true'}, '2': {label: 'field'}},
                          ff_presets: 'radio:radioEmpty:inlineItems:inlineTitle:shrink',
                          ff_dataMap: [
                            {from: './@value', to: '../additionalItemsField/@/params/hidden', $: '^/fn/equal|^/fn/not', args: ['${0}', 'field']},
                            {from: './@value', to: '../additionalItemsField/@/oneOf', $: '^/fn/iif', args: [{$: '^/fn/equal', args: ['${0}', 'field']}, 1, 0]}

                          ]
                        },
                        additionalItemsField: {
                          oneOf:
                            [
                              {type: 'null'},
                              {$ref: '#/definitions/fieldTop'},
                            ]

                        },
                        minItems: {
                          title: 'min',
                          type: ['null', 'integer'],
                          ff_presets: 'integerNull:inlineTitle:autowidth',
                        },
                        maxItems: {
                          title: 'max',
                          type: ['null', 'integer'],
                          ff_presets: 'integerNull:inlineTitle:autowidth',
                        },
                        uniqueItems: {
                          allOf: [
                            {$ref: '#/definitions/tristate'},
                            {title: 'Unique items'}
                          ]
                        },
                      }
                    },
                    objectProps: {
                      type: "object",
                      ff_presets: 'object:noTitle',
                      ff_layout: [{
                        className: {inline: true},
                        $_fields: ['additionalProperties', 'minProperties', 'maxProperties', 'required']
                      }],
                      // ff_params: {hidden: true},
                      properties: {
                        required: {
                          title: 'required',
                          type: "array",
                          ff_managed: true,
                          allOf: [{$ref: '#/definitions/reactSelectArray'},
                            {
                              ff_custom: {
                                $_ref: '^/sets/inlineTitle:^/sets/expand',
                              }
                            }],
                          items: {type: 'string'}
                        },
                        minProperties: {
                          title: 'min',
                          type: ['null', 'integer'],
                          ff_presets: 'integerNull:inlineTitle:autowidth',
                        },
                        maxProperties: {
                          title: 'max',
                          type: ['null', 'integer'],
                          ff_presets: 'integerNull:inlineTitle:autowidth',
                        },
                        additionalProperties: {
                          title: 'Props: additional',
                          type: "string",
                          'default': '',
                          ff_data: {fData: {'enum': ['false', 'true', 'field']}},
                          // ff_enumExten: {'0': {label: 'false'}, '1': {label: 'true'}, '2': {label: 'object'}},
                          ff_presets: 'radio:radioEmpty:inlineItems:inlineTitle:shrink',
                          ff_dataMap: [
                            {from: './@value', to: '../additionalPropertiesField/@/params/hidden', $: '^/fn/equal|^/fn/not', args: ['${0}', 'field']},
                            {from: './@value', to: '../additionalPropertiesField/@/oneOf', $: '^/fn/iif', args: [{$: '^/fn/equal', args: ['${0}', 'field']}, 1, 0]}
                          ]
                        },
                        additionalPropertiesField: {
                          oneOf:
                            [
                              {type: 'null'},
                              {$ref: '#/definitions/fieldTop'},
                            ]
                        },

                      }
                    },
                    combine: {
                      type: 'object',
                      ff_presets: 'object:noTitle',
                      ff_dataMap: [{from: './selector@value', to: '/@/selectorValue'}],
                      ff_layout: [{
                        className: {inline: true},
                        $_fields: [
                          'selector',
                          {
                            "$_ref": "^/parts/ArrayAddButton",
                            "children": ["+field"],
                            "onClick": {$: '^/_usr/addCombine', args: [0]},
                            style: {marginRight: '-1px', marginLeft: '1em'},
                            $_maps: {
                              'className/hidden': false,
                              disabled: false
                            }
                          },
                          {
                            "$_ref": "^/parts/ArrayAddButton",
                            "children": ["+strings"],
                            "onClick": {$: '^/_usr/addCombine', args: [1]},
                            $_maps: {
                              'className/hidden': {$: '^/fn/equal|^/fn/not', args: ['@selectorValue', 'dependencies']},
                              disabled: false
                            }
                          }
                        ]
                      }]
                      ,
                      properties: {
                        selector: {
                          type: 'string',
                          'enum': ['dependencies', 'patternProperties', 'allOf', 'oneOf', 'anyOf', 'not'],
                          ff_presets: 'radio:radioEmpty:inlineItems:inlineTitle:shrink',
                        },
                        allOf: {
                          allOf: [{$ref: '#/definitions/combineArray'}, {ff_dataMap: {0: {args: {1: 'allOf'}}}}]
                        },
                        oneOf: {
                          allOf: [{$ref: '#/definitions/combineArray'}, {ff_dataMap: {0: {args: {1: 'oneOf'}}}}]
                        },
                        anyOf: {
                          allOf: [{$ref: '#/definitions/combineArray'}, {ff_dataMap: {0: {args: {1: 'anyOf'}}}}]
                        },
                        not: {
                          allOf: [{$ref: '#/definitions/combineArray'}, {ff_dataMap: {0: {args: {1: 'not'}}}, maxItems: 1}]
                        },
                        patternProperties: {
                          allOf: [{$ref: '#/definitions/combineArray'}, {ff_dataMap: {0: {args: {1: 'patternProperties'}}}}]
                          // title: 'patternProperties',
                          // "type": "array",
                          // ff_presets: 'array',
                          // items: {
                          //   $ref: '#/definitions/fieldTop'
                          // }
                        },
                        dependencies: {
                          allOf: [{$ref: '#/definitions/combineArray'},
                            {
                              ff_dataMap: {0: {args: {1: 'dependencies'}}},
                              items: {
                                oneOf: [
                                  {$ref: '#/definitions/fieldTop'},
                                  {
                                    type: 'object',
                                    ff_presets: 'object:inlineLayout:inlineArrayControls:arrayControls3but',

                                    properties: {
                                      mame: {
                                        type: 'string',
                                        ff_presets: 'string',
                                        ff_placeholder: 'Enter name...'
                                      },
                                      values: {
                                        allOf: [{$ref: '#/definitions/reactSelectArray'},
                                          {
                                            ff_custom: {
                                              $_ref: '^/sets/expand',
                                              //Main: {menuIsOpen: false}
                                            }
                                          }]

                                      }
                                    }
                                  }
                                ]
                              }
                            }],

                        },

                      }
                    }
                  }
                },
                ffProps: {
                  title: 'Extended properties:',
                  type: "object",
                  ff_presets: 'object',
                  ff_custom: {Wrapper: {style: {paddingBottom: '0em'}}},
                  ff_layout: [
                    {
                      className: {layout: true, inline: true},
                      $_fields: ['ff_placeholder', 'ff_params']
                    },
                    {
                      className: {layout: true, inline: true},
                      $_fields: ['ff_managed', 'ff_presets',
                        {
                          "$_ref": "^/parts/ArrayAddButton",
                          "children": ["+validator"],
                          onClick: {args: {1: "./ff_validators", 3: {"setOneOf": 0}}},
                          style: {marginRight: '-1px'},
                          $_maps: {
                            'className/hidden': false,
                            disabled: false
                          }
                        },
                        {
                          "$_ref": "^/parts/ArrayAddButton",
                          "children": ["+dataMap"],
                          onClick: {args: {1: "./ff_dataMap", 3: {"setOneOf": 0}}},
                          $_maps: {
                            'className/hidden': false,
                            disabled: false
                          }
                        },
                      ]
                    },

                  ],
                  properties: {
                    ff_presets: {
                      type: 'array',
                      title: 'ff_presets',
                      items: {type: 'string'},
                      ff_placeholder: 'Select sets...',
                      ff_presets: '^/_usrSets/reactSelect:noTitle:expand',
                      ff_custom: {
                        Main: {
                          isMulti: true,
                          closeMenuOnSelect: false,
                          $_maps: {
                            options: {$: '^/_usr/reactSelectPresetOptions|^/_usr/reactSelectValue', args: ['@/value', '@/fieldTypes']},
                          },
                        },
                      },
                      ff_managed: true,
                      //ff_custom: {$_ref: '^/_usrSets/presetSelect:^/sets/noTitle:^/sets/expand'},
                      ff_dataMap: [
                        //['./@/value', '../custom/@/value', presetValuesHandler]
                        {from: '../../../type/@/value', to: './@/fieldTypes'}
                      ]
                    },
                    ff_managed: {
                      type: 'boolean',
                      title: 'Self managed',
                      ff_presets: 'booleanLeft:shrink',
                      ff_custom: {Main: {className: {'radio-container': true}}},
                    },

                    ff_validators: {
                      type: 'array',
                      title: 'Validators',
                      ff_presets: 'array:noTitle',
                      items: {
                        'default': [''],
                        type: "array",
                        ff_presets: 'array:inlineLayout:noArrayButtons:noTitle:noArrayControls',
                        ff_layout: {
                          className: {'wrap': true}, $_fields: [
                            {
                              "$_ref": "^/parts/Button",
                              "children": ["x"],
                              onClick: {$: '^/fn/api', args: ["arrayItemOps", "./", 'del']},
                              $_maps: {
                                'className/hidden': false,
                                disabled: false
                              }
                            },
                            {$_ref: '^/sets/object/Title'}]
                        },
                        items: [
                          {type: 'string', ff_placeholder: 'Validator...', ff_presets: 'string:noArrayControls'},
                          {allOf: [{$ref: '#/definitions/arg'}, {default: {value: '"${0}"'}}]}
                        ],
                        minItems: 1,
                        additionalItems: {$ref: '#/definitions/arg'},
                      }
                    },
                    ff_dataMap: {
                      type: 'array',
                      title: 'Data Maps',
                      ff_presets: 'array:noTitle',
                      items: {
                        'default': ['', '', ''],
                        type: "array",
                        ff_presets: 'array:inlineLayout:noArrayButtons:noArrayControls',
                        ff_layout: {
                          className: {'wrap': true},
                          $_fields: [{
                            "$_ref": "^/parts/Button",
                            "children": ["x"],
                            onClick: {$: '^/fn/api', args: ["arrayItemOps", "./", 'del']},
                            $_maps: {
                              'className/hidden': false,
                              disabled: false
                            }
                          }, {$_ref: '^/sets/object/Title'}]
                        },

                        items: [
                          {type: 'string', ff_placeholder: 'From path...', ff_presets: 'string:noArrayControls'},
                          {type: 'string', ff_placeholder: 'Destination path...', ff_presets: 'string:noArrayControls'},
                          {type: 'string', ff_placeholder: 'Function', ff_presets: 'string:noArrayControls'},
                          {allOf: [{$ref: '#/definitions/arg'}, {default: {value: '"${0}"'}}]}
                        ],
                        minItems: 3,
                        additionalItems: {$ref: '#/definitions/arg'},
                      }
                    },
                    ff_placeholder: {
                      type: 'string',
                      title: 'placeholder',
                      ff_presets: 'string:inlineTitle:expand',
                    },
                    ff_params: {
                      allOf: [{$ref: '#/definitions/reactSelectArray'},
                        {
                          items: {type: "string"},
                          ff_data: {fData: {enum: paramsEnum}},
                          ff_placeholder: 'leading "!" set param to false.',
                          ff_custom: {
                            $_ref: '^/sets/inlineTitle:^/sets/expand',
                          }
                        }],
                    },
                    ff_custom: {
                      type: "object",
                      ff_presets: 'object:noTitle',
                      ff_layout: [{
                        className: {inline: true},
                        $_fields: [
                          'selector',
                          {
                            style: {marginRight: '1em'}
                          },
                          {
                            "$_ref": "^/parts/Button",
                            "children": ["disable"],
                            "onClick": "^/_usr/customDisable",
                            $_maps: {
                              'className/hidden': false,
                              'className/selected': {$: '^/_usr/customIsDisabled', args: ['@/params/selectorMapped', '@/params/enumExtenMapped']},
                              disabled: false, //{$: '^/fn/equal', args: ['@/params/selectorMapped', '', '$_parse']}
                            }
                          }
                        ]
                      }],
                      properties: {
                        selector: {
                          type: 'string',
                          title: 'Customization',
                          ff_presets: 'radio:radioEmpty:inlineItems:inlineTitle:shrink',
                          ff_data: {fData: {enumExten: []}},
                          ff_dataMap: [
                            {from: './@/value', to: '../valueArray/@/value', $: '^/_dataMaps/valueArraySel'},
                            {from: './@/value', to: '../@/params/selectorMapped'},
                            {from: './@/fData/enumExten', to: '../@/params/enumExtenMapped'}

                          ]
                        },
                        selectorVals: {
                          type: 'array',
                          items: {type: 'string'},
                          ff_params: {norender: true},
                          ff_managed: true,
                          ff_dataMap: [
                            {from: '../../ff_presets/@/value,fieldTypes', to: './', $: '^/_dataMaps/customSelectors', args: ['@/value', '@/fieldTypes']},
                          ]
                        },
                        valueArray: {
                          type: 'array',
                          ff_presets: 'array:noArrayControls:noTitle',
                          items: {
                            allOf: [
                              {$ref: '#/definitions/jsonEditor'},
                              {
                                ff_dataMap: [{from: './@/json', to: '../../selector/@/fData/enumExten', $: '^/_dataMaps/jsonMap'}],
                              }
                            ]
                          }
                        },

                      },
                    },
                    // ff_data: {
                    //   type: 'array',
                    //   title: 'Data',
                    //   ff_presets: 'array:inlineTitle',
                    //   items: {
                    //     allOf: [
                    //       {$ref: '#/definitions/object'},
                    //       {
                    //         ff_params: {hideExternal: false},
                    //       }
                    //     ]
                    //   }
                    // }
                  }
                },
                restProps: {
                  allOf: [
                    {$ref: '#/definitions/jsonEditor'},
                    {properties: {value: {title: 'Rest properties:'}}}
                  ]
                  // type: 'string',
                  // title: 'Rest properties:',
                  // ff_presets: 'textarea',
                  // ff_custom: {Wrapper: {className: {'object-wrapper': true}}},
                  // ff_validators: ['^/_usr/addBrackets/|^/_validators/testJSON'],
                }
              }
            }
          ]
        },
        //fieldProps: 
        layout: {allOf: [{$ref: '#/definitions/layoutTop'}]}
      }
    }
  },

  //title: 'Form:',
  type: 'object',
  allOf:
    [
      {$ref: '#/definitions/fieldTop'},
      {
        properties: {
          name: {
            ff_placeholder: 'Enter form name...'
          }
        }
      }
    ]
};


export {paramsEnum}
export default FFormSchema;
// export {objectSchema}