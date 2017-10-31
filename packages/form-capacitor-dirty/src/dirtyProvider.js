import React from 'react';
import {createEagerFactory, wrapDisplayName, shallowEqual} from 'recompact';
import {ContextStore, StoreShape, ContextPath, PathShape, DATA_ROOT, defaultStore, DIRTY_ROOT, ContextDirty, DirtyShape} from 'form-capacitor-store';
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

                const dataPath = getValue(context, ContextPath);
                if(!dataPath) {
                    throw new Error("`dirtyProvider` must be added after `withValue`; context path was not found")
                }
                
                const fullPath = [DATA_ROOT, ...dataPath];

                const store = (options.store && resolveValue(options.store, this.props)) || (context && context[ContextStore]) || defaultStore;
                
                const initialData = getValue(store, fullPath);

                // console.log(JSON.stringify([store,defaultStore,context[ContextStore],[DIRTY_ROOT, ...dataPath], initialData],null,2));
                setValue(store, [DIRTY_ROOT, ...dataPath], initialData);
            }

            render() {
                return factory();
            }
        }
    }
}