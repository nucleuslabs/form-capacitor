import React from 'react';
import {createEagerFactory, wrapDisplayName, shallowEqual, getDisplayName} from 'recompact';
import {ContextStore, StoreShape, CTX_KEY_PATH, CTX_VAL_PATH, DATA_ROOT, defaultStore, INIT_ROOT, ContextDirty, DirtyShape, pubSub, ERROR_ROOT, CTX_KEY_SCHEMA_ID, CTX_VAL_SCHEMA_ID, ERR} from 'form-capacitor-store';
// import {resolveValue, defaults, setValue} from 'form-capacitor-util/util';
import {get as getValue, toPath, unset, set as setValue,omit,pick} from 'lodash';
import Ajv, {KeywordDefinition} from 'ajv';
import installAjvKeywords from 'ajv-keywords'; // todo: asynchronously import() these libs so they can be disabled if necessary or loaded in later
// import installAjvErrors from 'ajv-errors';
// import installAjvAsync from 'ajv-async';
import ShortId from 'shortid';
import {resolveValue} from '../../form-capacitor-util/util';
import {EMPTY_ARRAY} from '../../form-capacitor-state/src/constants';


export default function withErrors(options) { // altname: dirtyRoot ??

    options = {
        path: p => p.path,
        schemaId: undefined,
        errorsProp: 'errors',
        includeChildren: false,
        ...options,
    };


    return BaseComponent => {

        // console.log(`${getDisplayName(BaseComponent)} has schema:\n${JSON.stringify(options.schema,null,2)}`);

        return class extends React.Component {
            static displayName = wrapDisplayName(BaseComponent, 'withErrors');

            static contextTypes = {
                // [CTX_KEY_PATH]: CTX_VAL_PATH,
                [CTX_KEY_SCHEMA_ID]: CTX_VAL_SCHEMA_ID,
                // [ContextStore]: StoreShape,
            };

            constructor(props, context) {
                super(props, context);

                const schemaId = options.schemaId || context[CTX_KEY_SCHEMA_ID];
                
         
                // const basePath = context[CTX_KEY_PATH] || [];
                // const componentName = resolveValue(options.path, this.props);
                // let componentPath = componentName ? toPath(componentName) : [];
                const path = resolveValue(options.path, this.props);

                if(!schemaId) {
                    // fixme: can this be made more efficient by bypassing this HOC if there's no schema?
                    console.warn(`Schema not found for ${path ? path.join('.') : BaseComponent.displayName || 'unnamed field'}`);
                    return;
                }


                // console.log(options,this.props);
                
                if(!path) {
                    throw new Error("Missing `path`");
                }

                this.fullPath = [ERROR_ROOT, schemaId, ...path];
                // console.log(this.fullPath);

                // console.log(this.fullPath);
                
                this.state = {
                    errors: undefined,
                };
                // console.log(this.dataPath.join('.'));
            }

            componentWillMount() {
                if(this.fullPath) {
                    this.unsub = pubSub.subscribe(this.fullPath, obj => {
                        // console.log('got errors',errors);
                        // console.log(BaseComponent.displayName,'got change',getValue(this.store, this.fullPath));
                        // console.log('change',this.fullPath);
                        
                        if(options.includeChildren) {
                            this.setState({
                                errors: obj
                            });
                        } else {
                            this.setState({
                                errors: obj && obj[ERR] && obj[ERR].length ? obj[ERR] : EMPTY_ARRAY
                            });
                        }
                    });
                }
            }

            componentWillUnmount() {
                this.unsub && this.unsub();
            }


            render() {
                let props;
                if(this.fullPath) {
                    props = {
                        ...this.props,
                        [options.errorsProp]: this.state.errors,
                    };
                } else {
                    props = this.props;
                }
                return React.createElement(BaseComponent, props)
            }
        }
    }
}