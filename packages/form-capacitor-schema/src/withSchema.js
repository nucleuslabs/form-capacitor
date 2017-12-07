import React from 'react';
import {createEagerFactory, wrapDisplayName, shallowEqual, getDisplayName} from 'recompact';
import {ContextStore, StoreShape, CTX_KEY_PATH, CTX_VAL_PATH, DATA_ROOT, defaultStore, INIT_ROOT, ContextDirty, DirtyShape, pubSub, ERROR_ROOT, CTX_KEY_SCHEMA_ID, CTX_VAL_SCHEMA_ID, ERR, SCHEMA} from 'form-capacitor-store';
// import {resolveValue, defaults, setValue} from 'form-capacitor-util/util';
import { toPath, unset, omit,pick} from 'lodash';
import Ajv, {KeywordDefinition} from 'ajv';
import installAjvKeywords from 'ajv-keywords'; // todo: asynchronously import() these libs so they can be disabled if necessary or loaded in later
// import installAjvErrors from 'ajv-errors';
// import installAjvAsync from 'ajv-async';
import ShortId from 'shortid';
import {setValueMut,setValue,getValue} from '../../form-capacitor-util/util';
import {EMPTY_ARRAY} from '../../form-capacitor-state/src/constants';

function loadSchema(uri) {
    return fetch(uri).then(res => res.json());
}

export default function withSchema(options) { // altname: dirtyRoot ??

    options = {
        // path: undefined,
        schema: {},
        // path: undefined,
        schemaId: undefined,
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
        verbose: true,
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

    const fullSchema = {...options.schema, $async: true};
    const validatePromise = ajv.compileAsync(fullSchema);

    return BaseComponent => {
        const factory = createEagerFactory(BaseComponent);

        // console.log(`%c${getDisplayName(BaseComponent)} has schema:\n${JSON.stringify(options.schema,null,2)}`, 'color:blue');

        // function success() {
        //     console.log(`%c${getDisplayName(BaseComponent)}%c is %cvalid`,'font-weight:bold','','color: green');
        // }
        //
        // function fail(errors) {
        //     // console.dir(validate);
        //     console.log(`%c${getDisplayName(BaseComponent)}%c is %cinvalid%c${errors.map(err => `\n- ${err.dataPath ? `${err.dataPath.slice(1)} ` : ''}${err.message}`).join('')}`,'font-weight:bold','','color: red','');
        // }

        return class extends React.Component {
            static displayName = wrapDisplayName(BaseComponent, 'withSchema');

            static contextTypes = {
                [CTX_KEY_PATH]: CTX_VAL_PATH,
                // [ContextStore]: StoreShape,
            };

            static childContextTypes = {
                [CTX_KEY_SCHEMA_ID]: CTX_VAL_SCHEMA_ID,
            };
            
            getChildContext() {
                return {[CTX_KEY_SCHEMA_ID]: this.schemaId};
            }
            

            _validate(value) {
                // TODO: validate against the schema, then push results into store
                // TODO: make this async https://github.com/epoberezkin/ajv#asynchronous-schema-compilation
                // console.log('validating',value);

                validatePromise.then(validate => {
                    validate(value).then(() => {
                        pubSub.unset(this.errorPath);
                    },errResult => {
                        if(errResult instanceof Ajv.ValidationError) {
                            // fail(err.errors);
                            // console.log(ajv.getSchema());
                            // console.log(JSON.stringify(errResult.errors,null,2));
                            
                            let schema = getValue(ajv, ['_refs','','schema']) || fullSchema; // <-- not sure how to get current/compiled schema; https://stackoverflow.com/q/47519242/65387
                                // https://stackoverflow.com/a/47527398/65387
                            
                            // get the schema with the error: https://stackoverflow.com/a/47557065/65387
                            let errors = {
                                [SCHEMA]: schema,
                            };
                            // console.log(ajv);
                            // debugger;
                            
                            for(let err of errResult.errors) {
                                const dataPath = err.dataPath ? toPath(err.dataPath.slice(1)) : EMPTY_ARRAY;
                                const errPath = [...dataPath, ERR];
                                // const fullPath = [...this.errorPath, ...dataPath];

                                // console.log(err);
                                // setValue(errors,dataPath, pick(err,['message','keyword']));
                                
                                let errObj = pick(err,['message','keyword','params']);
                                // console.log('err',err,schemaPathToArray(err.schemaPath));
                                errObj.value = pubSub.get([DATA_ROOT, ...this.rootPath, ...dataPath]);
                                // const schemaPath = schemaPathToArray(err.schemaPath);
                                // console.log(schemaPath);
                                // errObj.schema = getValue(options.schema,schemaPath);
                                // errObj.title = getValue(options.schema,[...schemaPath.slice(0,-1),'title']);
                                // console.log("PAAATH",[DATA_ROOT, ...this.rootPath, ...dataPath]);
                                
                                let fieldErrors = getValue(errors, errPath);
                                fieldErrors = fieldErrors ? [...fieldErrors, errObj] : [errObj];
                                setValueMut(errors,errPath, fieldErrors);
                                // console.log('setttin ze errros',[...dataPath,ERR]);
                          
                                // console.log(fullPath,err.message);
                            }
                            
                            // console.log('%c'+JSON.stringify(errors,null,2),'color:red');
                            // console.log('setting',this.errorPath,errors);
                            pubSub.set(this.errorPath, errors);
                            // console.log('getting',pubSub.get(this.errorPath));
                        } else {
                            throw errResult;
                        }
                    });
                });
            }
            
            constructor(props, context) {
                super(props, context);

                this.rootPath = getValue(context, [CTX_KEY_PATH]);
                // console.log(context,CTX_KEY_PATH);
                
                if(!this.rootPath) {
                    throw new Error("`withSchema` must be added after `withValue`; context path was not found")
                }
                
                // console.log(options);
                if(options.id) {
                    this.schemaId = options.id;
                } else if(options.schemaId === '$id') {
                    this.schemaId = options.schema.$id;
                } else if(options.schemaId === 'id') {
                    this.schemaId = options.schema.id;
                } else {
                    this.schemaId = options.schema.$id || options.schema.id || ShortId.generate();
                }
                if(!this.schemaId) {
                    throw new Error("Missing `schemaId`");
                }
                
                this.errorPath = [ERROR_ROOT,this.schemaId,...this.rootPath];
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
                    this._validate(nextProps[options.valueProp]); // fixme: should we read from valueProp or directly from the store..?
                }
            }

            render() {
                // console.log('withSchema.render',this.props[options.valueProp]);
                return factory(this.props);
            }
        }
    }
}

function schemaPathToArray(path) {
    if(!path) return [];
    return path.slice(2).split('/');
}