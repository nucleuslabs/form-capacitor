import React from 'react';
import {createEagerFactory, wrapDisplayName, shallowEqual, getDisplayName} from 'recompact';
import {ContextStore, StoreShape, CTX_KEY_PATH, CTX_VAL_PATH, DATA_ROOT, defaultStore, INIT_ROOT, ContextDirty, DirtyShape, pubSub, ERROR_ROOT, CTX_KEY_SCHEMA_ID, CTX_VAL_SCHEMA_ID} from 'form-capacitor-store';
// import {resolveValue, defaults, setValue} from 'form-capacitor-util/util';
import {get as getValue, toPath, unset, set as setValue,omit,pick} from 'lodash';
import Ajv, {KeywordDefinition} from 'ajv';
import installAjvKeywords from 'ajv-keywords'; // todo: asynchronously import() these libs so they can be disabled if necessary or loaded in later
// import installAjvErrors from 'ajv-errors';
// import installAjvAsync from 'ajv-async';
import ShortId from 'shortid';
import {resolveValue} from '../../form-capacitor-util/util';


export default function withErrors(options) { // altname: dirtyRoot ??

    options = {
        path: p => p.name,
        schemaId: undefined,
        errorsProp: 'errors',
        ...options,
    };


    return BaseComponent => {
        const factory = createEagerFactory(BaseComponent);

        // console.log(`${getDisplayName(BaseComponent)} has schema:\n${JSON.stringify(options.schema,null,2)}`);

        return class extends React.Component {
            static displayName = wrapDisplayName(BaseComponent, 'withErrors');

            static contextTypes = {
                [CTX_KEY_PATH]: CTX_VAL_PATH,
                [CTX_KEY_SCHEMA_ID]: CTX_VAL_SCHEMA_ID,
                // [ContextStore]: StoreShape,
            };

            constructor(props, context) {
                super(props, context);

                const schemaId = options.schemaId || context[CTX_KEY_SCHEMA_ID];
                
                if(!schemaId) {
                    throw new Error('Schema not found');
                }
                
                const basePath = context[CTX_KEY_PATH] || [];
                const componentName = resolveValue(options.path, this.props);
                let componentPath = componentName ? toPath(componentName) : [];

                this.fullPath = [ERROR_ROOT, schemaId, ...basePath, ...componentPath];

                // console.log(this.fullPath);
                
                this.state = {
                    errors: undefined,
                };
                // console.log(this.dataPath.join('.'));
            }

            componentWillMount() {
                this.unsub = pubSub.subscribe(this.fullPath, errors => {
                    // console.log(BaseComponent.displayName,'got change',getValue(this.store, this.fullPath));
                    // console.log('change',this.fullPath);
                    this.setState({errors});
                });
            }

            componentWillUnmount() {
                this.unsub();
            }


            render() {
                const props = {
                    ...this.props,
                    [options.errorsProp]: this.state.errors,
                };
                return factory(props);
            }
        }
    }
}