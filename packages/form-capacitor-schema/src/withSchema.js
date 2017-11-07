import React from 'react';
import {createEagerFactory, wrapDisplayName, shallowEqual, getDisplayName} from 'recompact';
import {ContextStore, StoreShape, CTX_KEY_PATH, CTX_VAL_PATH, DATA_ROOT, defaultStore, INIT_ROOT, ContextDirty, DirtyShape, pubSub, ERROR_ROOT} from 'form-capacitor-store';
// import {resolveValue, defaults, setValue} from 'form-capacitor-util/util';
import {get as getValue, toPath, unset, set as setValue,omit,pick} from 'lodash';
import Ajv, {KeywordDefinition} from 'ajv';
import installAjvKeywords from 'ajv-keywords'; // todo: asynchronously import() these libs so they can be disabled if necessary or loaded in later
// import installAjvErrors from 'ajv-errors';
// import installAjvAsync from 'ajv-async';
import ShortId from 'shortid';

function loadSchema(uri) {
    return fetch(uri).then(res => res.json());
}

export default function withSchema(options) { // altname: dirtyRoot ??

    options = {
        // path: undefined,
        schema: {},
        // path: undefined,
        schemaId: '$id',
        ...options,
    };

    const ajv = new Ajv({
        allErrors: true,
        $data: true,
        ownProperties: true,
        errorDataPath: 'property',
        jsonPointers: false,
        schemaId: undefined,
        async: true,
        loadSchema,
    });
    // installAjvAsync(ajv);
    installAjvKeywords(ajv);
    // installAjvErrors(ajv); // causes "Ajv option jsonPointers changed to true"

    if(options.formats) {
        for (let k of Object.keys(options.formats)) {
            ajv.addFormat(k, options.formats[k]);
        }
    }
    if(options.keywords) {
        for (let k of Object.keys(options.keywords)) {
            ajv.addKeyword(k, options.keywords[k]);
        }
    }

    const validatePromise = ajv.compileAsync({...options.schema, $async: true});

    return BaseComponent => {
        const factory = createEagerFactory(BaseComponent);

        // console.log(`${getDisplayName(BaseComponent)} has schema:\n${JSON.stringify(options.schema,null,2)}`);

        function success() {
            console.log(`%c${getDisplayName(BaseComponent)}%c is %cvalid`,'font-weight:bold','','color: green');
        }

        function fail(errors) {
            // console.dir(validate);
            console.log(`%c${getDisplayName(BaseComponent)}%c is %cinvalid%c${errors.map(err => `\n- ${err.dataPath ? `${err.dataPath.slice(1)} ` : ''}${err.message}`).join('')}`,'font-weight:bold','','color: red','');
        }

        return class extends React.Component {
            static displayName = wrapDisplayName(BaseComponent, 'withSchema');

            static contextTypes = {
                [CTX_KEY_PATH]: CTX_VAL_PATH,
                // [ContextStore]: StoreShape,
            };


            _validate(value) {
                // TODO: validate against the schema, then push results into store
                // TODO: make this async https://github.com/epoberezkin/ajv#asynchronous-schema-compilation
                // console.log('validating',value);

                validatePromise.then(validate => {
                    validate(value).then(success,errResult => {
                        if(errResult instanceof Ajv.ValidationError) {
                            // fail(err.errors);
                            // console.log(JSON.stringify(errResult.errors,null,2));
                            
                            let errors = Object.create(null);
                            
                            for(let err of errResult.errors) {
                                const dataPath = err.dataPath ? toPath(err.dataPath.slice(1)) : [];
                                // const fullPath = [...this.errorPath, ...dataPath];

                                // console.log(err);
                                // setValue(errors,dataPath, pick(err,['message','keyword']));
                                setValue(errors,dataPath, err);
                          
                                // console.log(fullPath,err.message);
                            }
                            
                            console.log('%c'+JSON.stringify(errors,null,2),'color:red');
                            pubSub.set(this.errorPath, errors);
                        } else {
                            throw errResult;
                        }
                    });
                });
            }
            
            constructor(props, context) {
                super(props, context);

                const dataPath = getValue(context, CTX_KEY_PATH);
                
                if(!dataPath) {
                    throw new Error("`withSchema` must be added after `withValue`; context path was not found")
                }
                
                let id;
                if(options.id) {
                    id = options.id;
                } else if(options.schemaId === '$id') {
                    id = options.schema.$id;
                } else if(options.schemaId === 'id') {
                    id = options.schema.id;
                } else {
                    id = options.schema.$id || options.schema.id;
                }
                if(!id) {
                    id = ShortId.generate();
                }
                
                this.errorPath = [ERROR_ROOT,id,...dataPath];
            }

            componentWillMount() {
                this._validate(this.props[options.valueProp]);
            }

            componentWillUnmount() {
                if(this.clearOnUnmount) {
                    pubSub.unset(this.errorPath);
                }
            }
            
            componentWillReceiveProps(nextProps) {
                if(nextProps[options.valueProp] !== this.props[options.valueProp]) {
                    this._validate(nextProps[options.valueProp]);
                }
            }

            render() {
                // console.log('withSchema.render',this.props[options.valueProp]);
                return factory(this.props);
            }
        }
    }
}