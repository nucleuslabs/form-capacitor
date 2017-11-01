import React from 'react';
import {createEagerFactory, wrapDisplayName, shallowEqual} from 'recompact';
import {ContextStore, StoreShape, ContextPath, PathShape, DATA_ROOT, defaultStore, DIRTY_ROOT, ContextDirty, DirtyShape, pubSub} from 'form-capacitor-store';
import {resolveValue, defaults, setValue} from 'form-capacitor-util/util';
import {get as getValue, toPath, unset} from 'lodash';

export default function dirtyProvider(options) {
    
    options = {
        // data: undefined,
        // store: undefined,
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
                // [ContextStore]: StoreShape,
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
                
                // const fullPath = [DATA_ROOT, ...this.dataPath];

              
                
                // const initialData = pubSub.get([DATA_ROOT, ...this.dataPath]);

                // console.log(JSON.stringify([store,defaultStore,context[ContextStore],[DIRTY_ROOT, ...this.dataPath], initialData],null,2));
                pubSub.set([DIRTY_ROOT, ...this.dataPath], pubSub.get([DATA_ROOT, ...this.dataPath]));
            }
            
            resetState = () => {
                pubSub.set([DATA_ROOT, ...this.dataPath], pubSub.get([DIRTY_ROOT, ...this.dataPath]));
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