// import {constrElements} from "./FFEditor";


import {types as jsonTypes} from 'fform/src/stateLib';

const paramsEnum = ['autofocus', 'liveUpdate', 'liveValidate', 'readonly', 'disabled', 'hidden', 'norender', 'viewer'];


const FFormSchema: JsonSchema = {
  definitions: {
    tristateNoPadding: {
      allOf: [{$ref: '#/definitions/tristate'},
        {_custom: {Wrapper: {className: {'no-side-padding': true}}},}
      ]
    },
    tristate: {
      type: ["null", "boolean"],
      _presets: 'booleanNullLeft:$inlineTitle:$shrink',
      _custom: {Main: {className: {'fform-radio-container': true}}},
    },
    arg: {
      allOf: [
        {$ref: '#/definitions/jsonEditor'},
        {
          _layout: {
            className: {'field-bg': true},
            $_fields: {0: {$_fields: {0: {$_fields: {5: {buttons: ['del'], style: {marginLeft: '-0.5em'}}}}}}}
          },
          _custom: {Wrapper: {className: {'object-arg': true}}},
          properties: {
            //name: {_params: {norender: true}},
            value: {_custom: {Wrapper: {style: {marginLeft: '-0.9em'}}}}
          }
        }]
    },
    reactSelectStatic: {
      type: 'array',
      _simple: true,
      _presets: '^/_usrSets/reactSelect:^/_usrSets/rsStatic:^/_usrSets/rsMulti:$inlineArrayControls:$arrayControls3but',
      _placeholder: 'Select values,,,'
    },
    reactSelectArray: {
      type: 'array',
      _simple: true,
      _presets: '^/_usrSets/reactSelect:^/_usrSets/rsMulti:$inlineArrayControls:$arrayControls3but',
      _placeholder: 'Enter values,,,'
    },
    combineArray: {
      type: "array",
      _presets: 'array:$noTitle',
      _stateMaps: [{from: '../selector/@/value', to: './@/params/hidden', $: '^/fn/equal|^/fn/not', args: ['${0}', '']}],
      _layout: ['^/_parts/emptyArray'],
      items: {
        oneOf:
          [{$ref: '#/definitions/fieldTop'}]
      }
    },
    fieldTop: {
      allOf: [{$ref: '#/definitions/field'},
        {
          properties: {
            propOrItem: {_params: {norender: true}},
          },
          _params: {showMoveOut: false},
        }
      ]
    },
    layoutTop: {
      allOf: [
        {$ref: '#/definitions/layout'},
        {
          _params: {hideExternal: true},
          _stateMaps: [
            {from: '../type@value', to: './@/params/propOrItemShown', $: '^/stateMaps/showPropOrItem'},
            {from: '../@params/expanded', to: './@/params/hideTopLine', $: '^/fn/not'}
          ],
          properties: {
            fieldsEnabled: {_params: {norender: true}, default: true},
            value: {title: 'Layout:'}
          },
          _layout: {
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
          _params: {hideExternal: false},
          _stateMaps: [{from: '../../@/params/propOrItemShown', to: './@/params/propOrItemShown'}],
          properties: {
            // type: {_params: {norender: true}, default: 'object'},
            // name: {_params: {norender: true}},
            fieldsEnabled: {
              type: 'boolean',
              title: '$_fields',
              _presets: 'booleanLeft:$shrink',
              _custom: {Main: {className: {'fform-radio-container': true}}},
              _stateMaps: [
                {from: './@/value', to: '../@/params/fieldsShown'},
                {from: './@/value', to: '../fields/@/params/hidden', $: '^/fn/not'}

              ],
            },
            fields: {
              type: 'array',
              _presets: 'array:$noTitle',
              items: {
                _oneOfSelector: '^/_usr/oneOfField',
                oneOf: [
                  {
                    allOf: [{$ref: '#/definitions/field'}, {
                      _layout: {className: {'field-bg': true}},
                      _params: {showMoveOut: true},
                    }]
                  },
                  {
                    allOf: [{$ref: '#/definitions/layout'},
                      {
                        _layout: {className: {'object-bg': true}},
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
      _presets: 'object:$noArrayControls',
      // _custom: {Wrapper: {className: {'object-prop': true}}},
      _data: {moveOpts: [], json: {}},
      _params: {hideTopLine: false},
      _layout: {
        $_fields: [
          {
            $_maps: {'className/fform-hidden': '@/params/hideTopLine'},
            $_fields: [
              {
                className: {'fform-inline': true},
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
                      'className/fform-hidden': '!@/params/fieldsShown',
                      disabled: false
                    }
                  },
                  {
                    "$_ref": "^/parts/ArrayAddButton",
                    "children": ["+object"],
                    onClick: {args: {1: "./fields", 3: {"setOneOf": 1}}},
                    $_maps: {
                      'className/fform-hidden': '!@/params/fieldsShown',
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
                $_maps: {'className/fform-hidden': '!@/params/expanded'}
              }
            ]
          }
        ]
      },
      properties: {
        value: {
          type: "string",
          _placeholder: 'Enter JSON value...',
          _presets: 'string:$expand:$inlineTitle',
          _validators: [{$: '^/_validators/testJSON', args: ['${0}', '../@/json']}],
        },
      }
    },
    objectTop: {
      allOf: [
        {$ref: '#/definitions/object'},
        {_custom: {Wrapper: {className: {'object-prop': false}}}}]
    },
    field: {
      type: "object",
      _presets: 'object:$noArrayControls',
      _custom: {
        Wrapper: {
          onClick: '^/_usr/selectField',
          $_maps: {'className/field-selected': '@/params/fieldSelected'}
        }
      },
      _layout: {
        className: {'fform-layout': true, block: true},
        // _params: {showMoveOut: false},
        $_fields: [{
          className: {'fform-inline': true, 'fform-layout': true},
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
                'className/fform-hidden': '@/params/fieldsAddHidden',
                disabled: false
              }
            },
            {
              "$_ref": "^/parts/ArrayAddButton",
              "children": ["+object"],
              onClick: {args: {1: "./layout/fields", 3: {"setOneOf": 1}}},//["./layout/fields", 1, {"setOneOf": 1}]},
              $_maps: {
                'className/fform-hidden': '@/params/fieldsAddHidden',
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
            //     'className/fform-hidden': {$: '^/fn/not', args: '@/params/showMoveOut'},
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
      _stateMaps: [{from: './@/params/expanded', to: './fieldProps/@/params/hidden', $: '^/fn/not'}],
      // expanded:true
      properties: {
        propOrItem: {
          type: 'array',
          _simple: true,
          _enumExten: {'property': true, 'item': true},
          default: ['property'],
          _presets: 'checkboxes:$inlineItems:$inlineTitle:$shrink',
          items: {type: 'string'},
          _stateMaps: [{from: '../../../@/params/propOrItemShown', to: './@/params/hidden', $: '^/stateMaps/mapPropOrItem'}]
        },
        name: {
          type: "string",
          _presets: 'string',
          _placeholder: 'Enter field name...',
          _custom: {Main: {className: {bold: true}}}
          // _params: {hidden: false},
        },
        refEnabled: {
          type: 'boolean',
          title: '$ref',
          _presets: 'booleanLeft:$shrink',
          _custom: {Main: {className: {'fform-radio-container': true}}},
          _stateMaps: [
            {from: './@/value', to: '../ref/@/params/hidden', $: '^/fn/not'},
            {from: './@/value', to: '../type/@/params/hidden'}
          ],

        },
        ref: {
          type: 'string',
          _placeholder: '',
          _presets: 'string:$inlineTitle'
        },
        type: {
          allOf: [{$ref: '#/definitions/reactSelectStatic'},
            {
              //type: "array",
              //'default': [],
              //_presets: 'checkboxes:$inlineItems:$inlineTitle:$shrink',
              //_simple: true,
              _enumExten: jsonTypes,
              items: {"type": "string", enum: jsonTypes},
              _stateMaps: [{from: './@/value', to: '../', $: '^/stateMaps/fieldTypesSel'}],
              _placeholder: 'Select type,,,'
            }
          ],
        },
        fieldProps: {
          type: 'object',
          oneOf: [
            {_simple: true},
            {
              type: "object",
              _simple: false,
              _layout: {className: {'field-properties': true}},
              properties: {
                jsonProps: {
                  title: 'JSON Schema properties:',
                  type: "object",
                  _stateMaps: [{from: '../../type/@/value', to: './', $: '^/stateMaps/jsonPropsSel'}],
                  properties: {
                    commonProps: {
                      type: "object",
                      _presets: 'object:$noTitle',
                      _layout: [{
                        className: {'fform-inline': true},
                        $_fields: ['title', 'description', 'defaultUnescaped', 'default',
                          {
                            "$_ref": "^/parts/ArrayAddButton",
                            "children": ["+definition"],
                            onClick: {args: {1: "./definitions", 3: {"setOneOf": 0}}},//["./definitions", 1, {"setOneOf": 0}]},
                            $_maps: {
                              'className/fform-hidden': false,
                              disabled: false
                            }
                          },]
                      }],
                      properties: {
                        title: {
                          type: "string",
                          title: 'Title',
                          _placeholder: 'Title...',
                          _presets: 'string:$noTitle',
                        },
                        description: {
                          type: "string",
                          title: 'Description',
                          _placeholder: 'Description...',
                          _presets: 'string:$noTitle:$expand'
                        },
                        // defaultUnescaped: {
                        //   type: 'boolean',
                        //   title: 'Default',
                        //   _presets: 'booleanLeft:$shrink',
                        //   _custom: {Main: {className: {'fform-radio-container': true, unescaped: true}, style: {marginRight: '-1.1em'}}},
                        // },
                        'default': {
                          type: "string",
                          title: 'Default',
                          //_placeholder: 'Enter default...',
                          _presets: 'string:$inlineTitle',
                          _validators: ['^/_validators/testJSON'],
                        },
                        definitions: {
                          title: 'Definitions',
                          "type": "array",
                          _presets: 'array:$noTitle',
                          items: {
                            $ref: '#/definitions/fieldTop'
                          }
                        }
                      }
                    },
                    stringProps: {
                      type: "object",
                      _presets: 'object:$inlineLayout:$noTitle',
                      _layout: ['minLength', 'maxLength', 'format', 'pattern'],
                      properties: {
                        minLength: {
                          title: 'Length: min',
                          type: ['null', 'integer'],
                          minimum: 0,
                          _presets: 'integerNull:$inlineTitle:$autowidth'
                        },
                        maxLength: {
                          title: 'max',
                          type: ['null', 'integer'],
                          minimum: 0,
                          _presets: 'integerNull:$inlineTitle:$autowidth'
                        },
                        pattern: {title: 'Pattern', type: "string", _presets: 'string:$inlineTitle:$expand',},
                        format: {
                          title: 'Format',
                          type: "string",
                          'enum': ['', 'date-time', 'date', 'time', 'email', 'ipv4', 'ipv6', 'uri', 'color', 'hostname', 'phone', 'utc-millisec', 'alpha', 'alphanumeric'],
                          _enumExten: {'': {label: 'select format...'}},
                          _presets: 'select:$inlineTitle'
                        }
                      }
                    },
                    numberProps: {
                      type: "object",
                      _presets: 'object:$inlineLayout:$noTitle',
                      _layout: ['multipleOf', 'minimum', 'exclusiveMinimum', 'maximum', 'exclusiveMaximum', {$_ref: '^/parts/Expander'}],
                      properties: {
                        multipleOf: {
                          title: 'Multiple of',
                          type: ["null", "number"],
                          minimum: 0,
                          exclusiveMinimum: true,
                          _presets: 'numberNull:$inlineTitle:$autowidth'
                        },
                        maximum: {
                          title: 'max',
                          type: ["null", "number"],
                          _presets: 'numberNull:$inlineTitle:$autowidth'
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
                          _presets: 'numberNull:$inlineTitle:$autowidth'
                        },
                        exclusiveMinimum: {
                          allOf: [
                            {$ref: '#/definitions/tristate'},
                            {
                              title: 'Exclusive min',
                              _custom: {Main: {style: {marginRight: '1.0em'}}},
                            },
                          ]
                        },
                      }
                    },
                    arrayProps: {
                      type: "object",
                      _presets: 'object:$noTitle',
                      _layout: [{
                        className: {'fform-inline': true},
                        $_fields: ['additionalItems', 'minItems', 'maxItems', 'uniqueItems', {$_ref: '^/parts/Expander'}]
                      }],
                      // _params: {hidden: true},
                      properties: {
                        additionalItems: {
                          title: 'Items: additional',
                          type: "string",
                          'default': '',
                          _enumExten: {'false': true, 'true': true, 'field': true},
                          _presets: 'radio:$radioEmpty:$inlineItems:$inlineTitle:$shrink',
                          _stateMaps: [
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
                          _presets: 'integerNull:$inlineTitle:$autowidth',
                        },
                        maxItems: {
                          title: 'max',
                          type: ['null', 'integer'],
                          _presets: 'integerNull:$inlineTitle:$autowidth',
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
                      _presets: 'object:$noTitle',
                      _layout: [{
                        className: {'fform-inline': true},
                        $_fields: ['additionalProperties', 'minProperties', 'maxProperties', 'required']
                      }],
                      // _params: {hidden: true},
                      properties: {
                        required: {
                          title: 'required',
                          type: "array",
                          _simple: true,
                          allOf: [{$ref: '#/definitions/reactSelectArray'},
                            {
                              _custom: {
                                $_ref: '^/sets/$inlineTitle:^/sets/$expand',
                              }
                            }],
                          items: {type: 'string'}
                        },
                        minProperties: {
                          title: 'min',
                          type: ['null', 'integer'],
                          _presets: 'integerNull:$inlineTitle:$autowidth',
                        },
                        maxProperties: {
                          title: 'max',
                          type: ['null', 'integer'],
                          _presets: 'integerNull:$inlineTitle:$autowidth',
                        },
                        additionalProperties: {
                          title: 'Props: additional',
                          type: "string",
                          'default': '',
                          _enumExten: {'false': true, 'true': true, 'field': true},
                          _presets: 'radio:$radioEmpty:$inlineItems:$inlineTitle:$shrink',
                          _stateMaps: [
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
                    // combine: {
                    //   type: 'object',
                    //   _presets: 'object:$noTitle',
                    //   _stateMaps: [{from: './selector@value', to: '/@/selectorValue'}],
                    //   _layout: [{
                    //     className: {'fform-inline': true},
                    //     $_fields: [
                    //       'selector',
                    //       {
                    //         "$_ref": "^/parts/ArrayAddButton",
                    //         "children": ["+field"],
                    //         "onClick": {$: '^/_usr/addCombine', args: [0]},
                    //         style: {marginRight: '-1px', marginLeft: '1em'},
                    //         $_maps: {
                    //           'className/fform-hidden': false,
                    //           disabled: false
                    //         }
                    //       },
                    //       {
                    //         "$_ref": "^/parts/ArrayAddButton",
                    //         "children": ["+strings"],
                    //         "onClick": {$: '^/_usr/addCombine', args: [1]},
                    //         $_maps: {
                    //           'className/fform-hidden': {$: '^/fn/equal|^/fn/not', args: ['@selectorValue', 'dependencies']},
                    //           disabled: false
                    //         }
                    //       }
                    //     ]
                    //   }],
                    //   properties: {
                    //     selector: {
                    //       type: 'string',
                    //       'enum': ['dependencies', 'patternProperties', 'allOf', 'oneOf', 'anyOf', 'not'],
                    //       _presets: 'radio:$radioEmpty:$inlineItems:$inlineTitle:$shrink',
                    //     },
                    //     allOf: {
                    //       allOf: [{$ref: '#/definitions/combineArray'}, {_stateMaps: {0: {args: {1: 'allOf'}}}}]
                    //     },
                    //     oneOf: {
                    //       allOf: [{$ref: '#/definitions/combineArray'}, {_stateMaps: {0: {args: {1: 'oneOf'}}}}]
                    //     },
                    //     anyOf: {
                    //       allOf: [{$ref: '#/definitions/combineArray'}, {_stateMaps: {0: {args: {1: 'anyOf'}}}}]
                    //     },
                    //     not: {
                    //       allOf: [{$ref: '#/definitions/combineArray'}, {_stateMaps: {0: {args: {1: 'not'}}}, maxItems: 1}]
                    //     },
                    //     patternProperties: {
                    //       allOf: [{$ref: '#/definitions/combineArray'}, {_stateMaps: {0: {args: {1: 'patternProperties'}}}}]
                    //       // title: 'patternProperties',
                    //       // "type": "array",
                    //       // _presets: 'array',
                    //       // items: {
                    //       //   $ref: '#/definitions/fieldTop'
                    //       // }
                    //     },
                    //     dependencies: {
                    //       allOf: [{$ref: '#/definitions/combineArray'},
                    //         {
                    //           _stateMaps: {0: {args: {1: 'dependencies'}}},
                    //           items: {
                    //             oneOf: [
                    //               {$ref: '#/definitions/fieldTop'},
                    //               {
                    //                 type: 'object',
                    //                 _presets: 'object:$inlineLayout:$inlineArrayControls:$arrayControls3but',
                    //
                    //                 properties: {
                    //                   mame: {
                    //                     type: 'string',
                    //                     _presets: 'string',
                    //                     _placeholder: 'Enter name...'
                    //                   },
                    //                   values: {
                    //                     allOf: [{$ref: '#/definitions/reactSelectArray'},
                    //                       {
                    //                         _custom: {
                    //                           $_ref: '^/sets/$expand',
                    //                           //Main: {menuIsOpen: false}
                    //                         }
                    //                       }]
                    //
                    //                   }
                    //                 }
                    //               }
                    //             ]
                    //           }
                    //         }],
                    //
                    //     },
                    //
                    //   }
                    // }
                  }
                },
                ffProps: {
                  title: 'Extended properties:',
                  type: "object",
                  _presets: 'object',
                  _custom: {Wrapper: {style: {paddingBottom: '0em'}}},
                  _layout: [
                    {
                      className: {'fform-layout': true, 'fform-inline': true},
                      $_fields: ['_placeholder', '_params']
                    },
                    {
                      className: {'fform-layout': true, 'fform-inline': true},
                      $_fields: ['_simple', '_presets',
                        {
                          "$_ref": "^/parts/ArrayAddButton",
                          "children": ["+validator"],
                          onClick: {args: {1: "./_validators", 3: {"setOneOf": 0}}},
                          style: {marginRight: '-1px'},
                          $_maps: {
                            'className/fform-hidden': false,
                            disabled: false
                          }
                        },
                        {
                          "$_ref": "^/parts/ArrayAddButton",
                          "children": ["+dataMap"],
                          onClick: {args: {1: "./_stateMaps", 3: {"setOneOf": 0}}},
                          $_maps: {
                            'className/fform-hidden': false,
                            disabled: false
                          }
                        },
                      ]
                    },

                  ],
                  properties: {
                    _presets: {
                      type: 'array',
                      title: '_presets',
                      items: {type: 'string'},
                      _placeholder: 'Select sets...',
                      _presets: '^/_usrSets/reactSelect:$noTitle:$expand',
                      _custom: {
                        Main: {
                          isMulti: true,
                          closeMenuOnSelect: false,
                          $_maps: {
                            options: {$: '^/_usr/reactSelectPresetOptions|^/_usr/reactSelectValue', args: ['@/value', '@/fieldTypes']},
                          },
                        },
                      },
                      _simple: true,
                      //_custom: {$_ref: '^/_usrSets/presetSelect:^/sets/$noTitle:^/sets/$expand'},
                      _stateMaps: [
                        //['./@/value', '../custom/@/value', presetValuesHandler]
                        {from: '../../../type/@/value', to: './@/fieldTypes'}
                      ]
                    },
                    _simple: {
                      type: 'boolean',
                      title: 'Self managed',
                      _presets: 'booleanLeft:$shrink',
                      _custom: {Main: {className: {'fform-radio-container': true}}},
                    },

                    _validators: {
                      type: 'array',
                      title: 'Validators',
                      _presets: 'array:$noTitle',
                      items: {
                        'default': [''],
                        type: "array",
                        _presets: 'array:$inlineLayout:$noArrayButtons:$noTitle:$noArrayControls',
                        _layout: {
                          className: {'fform-wrap': true}, $_fields: [
                            {
                              "$_ref": "^/parts/Button",
                              "children": ["x"],
                              onClick: {$: '^/fn/api', args: ["arrayItemOps", "./", 'del']},
                              $_maps: {
                                'className/fform-hidden': false,
                                disabled: false
                              }
                            },
                            {$_ref: '^/sets/object/Title'}]
                        },
                        items: [
                          {type: 'string', _placeholder: 'Validator...', _presets: 'string:$noArrayControls'},
                          {allOf: [{$ref: '#/definitions/arg'}, {default: {value: '"${0}"'}}]}
                        ],
                        minItems: 1,
                        additionalItems: {$ref: '#/definitions/arg'},
                      }
                    },
                    _stateMaps: {
                      type: 'array',
                      title: 'Data Maps',
                      _presets: 'array:$noTitle',
                      items: {
                        'default': ['', '', ''],
                        type: "array",
                        _presets: 'array:$inlineLayout:$noArrayButtons:$noArrayControls',
                        _layout: {
                          className: {'fform-wrap': true},
                          $_fields: [{
                            "$_ref": "^/parts/Button",
                            "children": ["x"],
                            onClick: {$: '^/fn/api', args: ["arrayItemOps", "./", 'del']},
                            $_maps: {
                              'className/fform-hidden': false,
                              disabled: false
                            }
                          }, {$_ref: '^/sets/object/Title'}]
                        },

                        items: [
                          {type: 'string', _placeholder: 'From path...', _presets: 'string:$noArrayControls'},
                          {type: 'string', _placeholder: 'Destination path...', _presets: 'string:$noArrayControls'},
                          {type: 'string', _placeholder: 'Function', _presets: 'string:$noArrayControls'},
                          {allOf: [{$ref: '#/definitions/arg'}, {default: {value: '"${0}"'}}]}
                        ],
                        minItems: 3,
                        additionalItems: {$ref: '#/definitions/arg'},
                      }
                    },
                    _placeholder: {
                      type: 'string',
                      title: 'placeholder',
                      _presets: 'string:$inlineTitle:$expand',
                    },
                    _params: {
                      allOf: [{$ref: '#/definitions/reactSelectArray'},
                        {
                          items: {type: "string"},
                          _enumExten: paramsEnum,
                          _placeholder: 'leading "!" set param to false.',
                          _custom: {
                            $_ref: '^/sets/$inlineTitle:^/sets/$expand',
                          }
                        }],
                    },
                    _custom: {
                      type: "object",
                      _presets: 'object:$noTitle',
                      _layout: [{
                        className: {'fform-inline': true},
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
                              'className/fform-hidden': false,
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
                          _presets: 'radio:$radioEmpty:$inlineItems:$inlineTitle:$shrink',
                          _data: {fData: {enumExten: []}},
                          _stateMaps: [
                            {from: './@/value', to: '../valueArray/@/value', $: '^/stateMaps/valueArraySel'},
                            {from: './@/value', to: '../@/params/selectorMapped'},
                            {from: './@/fData/enumExten', to: '../@/params/enumExtenMapped'}

                          ]
                        },
                        selectorVals: {
                          type: 'array',
                          items: {type: 'string'},
                          _params: {norender: true},
                          _simple: true,
                          _stateMaps: [
                            {from: '../../_presets/@/value,fieldTypes', to: './', $: '^/stateMaps/customSelectors', args: ['@/value', '@/fieldTypes']},
                          ]
                        },
                        valueArray: {
                          type: 'array',
                          _presets: 'array:$noArrayControls:$noTitle',
                          items: {
                            allOf: [
                              {$ref: '#/definitions/jsonEditor'},
                              {
                                _stateMaps: [{from: './@/json', to: '../../selector/@/fData/enumExten', $: '^/stateMaps/jsonMap'}],
                              }
                            ]
                          }
                        },

                      },
                    },
                    // _data: {
                    //   type: 'array',
                    //   title: 'Data',
                    //   _presets: 'array:$inlineTitle',
                    //   items: {
                    //     allOf: [
                    //       {$ref: '#/definitions/object'},
                    //       {
                    //         _params: {hideExternal: false},
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
            _placeholder: 'Enter form name...'
          }
        }
      }
    ]
};


export {paramsEnum}
export default FFormSchema;
// export {objectSchema}