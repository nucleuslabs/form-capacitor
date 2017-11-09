import React from 'react';
import {createEagerFactory, wrapDisplayName, shallowEqual} from 'recompact';
import {ContextStore, StoreShape, CTX_KEY_PATH, CTX_VAL_PATH, DATA_ROOT, defaultStore, INIT_ROOT, ContextDirty, DirtyShape, pubSub} from 'form-capacitor-store';
import {resolveValue, defaults, setValue} from 'form-capacitor-util/util';
import {get as getValue, toPath, unset} from 'lodash';

export default function dirtyProvider(options) { // altname: dirtyRoot ??
    
    options = {
        // data: undefined,
        // store: undefined,
        resetStateProp: undefined,
        saveStateProp: undefined,
        // getStateProp: undefined,
        saveOnMount: true,
        ...options,
    };
    
    return BaseComponent => {
        const factory = createEagerFactory(BaseComponent);
        
        return class extends React.PureComponent {
            static displayName = wrapDisplayName(BaseComponent, 'dirtyProvider');

            static contextTypes = {
                [CTX_KEY_PATH]: CTX_VAL_PATH,
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

                this.dataPath = getValue(context, CTX_KEY_PATH);
                if(!this.dataPath) {
                    throw new Error("`dirtyProvider` must be added after `withValue`; context path was not found")
                }
                
                // const fullPath = [DATA_ROOT, ...this.dataPath];

              
                
                // const initialData = pubSub.get([DATA_ROOT, ...this.dataPath]);

                // console.log(JSON.stringify([store,defaultStore,context[ContextStore],[DIRTY_ROOT, ...this.dataPath], initialData],null,2));
                // if(options.saveOnMount) {
                //    
                // }
            }
            
            componentDidMount() {
                if(resolveValue(options.saveOnMount)) {
                    this.saveState();
                }
            }
            
            // getState = () => pubSub.get([DIRTY_ROOT, ...this.dataPath]);
            
            saveState = state => {
                pubSub.set([INIT_ROOT, ...this.dataPath], state !== undefined ? state : pubSub.get([DATA_ROOT, ...this.dataPath]));
            };
            
            resetState = () => {
                pubSub.set([DATA_ROOT, ...this.dataPath], pubSub.get([INIT_ROOT, ...this.dataPath]));
            };

            render() {
                const props = {...this.props};
                if(options.resetStateProp) {
                    props[options.resetStateProp] = this.resetState;
                }
                if(options.saveStateProp) {
                    props[options.saveStateProp] = this.saveState;
                }
                // if(options.getStateProp) {
                //     props[options.getStateProp] = this.getState;
                // }
                return factory(props);
            }
        }
    }
}