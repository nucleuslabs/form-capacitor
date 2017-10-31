import React from 'react';
import {createEagerFactory, wrapDisplayName, shallowEqual} from 'recompact';
import {ContextStore, StoreShape, ContextPath, PathShape, DATA_ROOT, defaultStore, DIRTY_ROOT, ContextDirty, DirtyShape, pubSub} from 'form-capacitor-store';
import {resolveValue, defaults, setValue} from 'form-capacitor-util/util';
import {get as getValue, toPath, unset} from 'lodash';

export default function dirtyProvider(options) {
    
    options = {
        // data: undefined,
        store: undefined,
        resetStateProp: undefined,
        markCleanProp: undefined,
        ...options,
    };
    
    return BaseComponent => {
        const factory = createEagerFactory(BaseComponent);
        
        return class extends React.PureComponent {
            static displayName = wrapDisplayName(BaseComponent, 'dirtyProvider');

            static contextTypes = {
                [ContextPath]: PathShape,
                [ContextStore]: StoreShape,
            };

            // static childContextTypes = {
            //     [ContextDirty]: DirtyShape,
            // };
            //
            // getChildContext() {
            //     return {[ContextDirty]: this.initialData};
            // }
            
            constructor(props, context) {
                super(props);

                this.dataPath = getValue(context, ContextPath);
                if(!this.dataPath) {
                    throw new Error("`dirtyProvider` must be added after `withValue`; context path was not found")
                }
                
                const fullPath = [DATA_ROOT, ...this.dataPath];

                this.store = (options.store && resolveValue(options.store, this.props)) || (context && context[ContextStore]) || defaultStore;
                
                const initialData = getValue(this.store, fullPath);

                // console.log(JSON.stringify([store,defaultStore,context[ContextStore],[DIRTY_ROOT, ...this.dataPath], initialData],null,2));
                setValue(this.store, [DIRTY_ROOT, ...this.dataPath], initialData);
            }
            
            resetState = () => {
                const dataPath = [DATA_ROOT, ...this.dataPath];
                const currentValue = getValue(this.store, dataPath);
                const initialValue = getValue(this.store, [DIRTY_ROOT, ...this.dataPath]);
                
             
                if(currentValue !== initialValue) {
                    setValue(this.store, dataPath, initialValue);
                    console.log('publish',dataPath);
                    pubSub.publish(dataPath);
                }
            };

            render() {
                const props = {...this.props};
                if(options.resetStateProp) {
                    props[options.resetStateProp] = this.resetState;
                }
                return factory(props);
            }
        }
    }
}