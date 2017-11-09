import React from 'react';
import {createEagerFactory, wrapDisplayName, shallowEqual} from 'recompact';
import {CTX_KEY_PATH, CTX_VAL_PATH, DATA_ROOT, store} from 'form-capacitor-store';
import {resolveValue} from '../../form-capacitor-util/util';


export default function withValue(options) {

    options = {
        path: p => p.path,
        clearOnUnmount: false,
        defaultValue: undefined,
        // selfUpdate: true,
        
        // output props:
        valueProp: undefined,
        setValueProp: undefined,
        // pathProp: undefined,
        
        ...options,
    };

    
    return BaseComponent => {
        class WithValue extends React.Component {

            constructor(props) {
                super(props);
                const path = resolveValue(options.path, props);
                if(!path) {
                    throw new Error("Missing `path`");
                }
                this.fullPath = [DATA_ROOT, ...path];

                let currentValue = store.get(this.fullPath);

                if(options.defaultValue !== undefined && currentValue === undefined) {
                    // not entirely sure if we want to support this feature yet
                    // fixme: i don't think we do because if, for example, we use a <DirtyLabel>
                    // before the input, then the input is going to change the value as soon
                    // as its mounted, causing the DirtyLabel to re-render and possibly flash.
                    // we want to encourage people to set the default values up front, at the form level
                    // ...however, it is a convenient way to set the form data too
                    // but even so, maybe we should disable it so users can load the form data
                    // via ajax instead and then call setValue() ??
                    store.set(this.fullPath, options.defaultValue);
                    currentValue = options.defaultValue;
                }

                // console.log('currentValue',currentValue);

                if(options.valueProp) {
                    this.state = {
                        value: currentValue
                    }
                }
            }

            setValue = (value,context) => {
                // console.log(selfUpdate);
                // console.log('setting',this.fullPath.join('.'),value,'was',this.state.value);
                // let skipUpdate = !options.selfUpdate && this.unsub;

                // this.setState({value});
                store.set(this.fullPath, value, context);
            };

            componentWillMount() {
                if(options.valueProp) {
                    this.unsub = store.subscribe(this.fullPath, value => {
                        // console.log(BaseComponent.displayName,'got change',getValue(this.store, this.fullPath));
                        // console.log('change',this.fullPath);
                        this.setState({value});
                    });
                }
            }

            componentWillUnmount() {
                if(options.valueProp) {
                    this.unsub();
                }
                if(resolveValue(options.clearOnUnmount,this.props)) {
                    store.unset(this.fullPath);
                }
            }
            
            render() {
                let props = {
                    ...this.props,
                };
                if(options.valueProp) {
                    props[options.valueProp] = this.state.value;
                    // console.log('this.state',this.state);
                    // console.log('props[valueProp]',props[valueProp]);
                }
                if(options.setValueProp) {
                    props[options.setValueProp] = this.setValue;
                }
             
                
                return React.createElement(BaseComponent, props);
            }
        };

        if(process.env.NODE_ENV !== 'production') {
            WithValue.displayName = wrapDisplayName(BaseComponent, 'withValue');
        }

        return WithValue;
    }
};
