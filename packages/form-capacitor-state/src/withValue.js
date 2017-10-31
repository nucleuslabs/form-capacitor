import React from 'react';
import {createEagerFactory, wrapDisplayName, shallowEqual} from 'recompact';
import PropTypes from 'prop-types';
import {resolveValue, defaults, setValue} from 'form-capacitor-util/util';
import {ContextStore, StoreShape, ContextPath, PathShape, DATA_ROOT} from 'form-capacitor-store';
import {defaultStore, pubSub} from 'form-capacitor-store';
import {get as getValue, toPath, unset} from 'lodash';
import {EMPTY_ARRAY,EMPTY_OBJECT} from './constants';
import ShortId from 'shortid';
// import Lo from 'lodash';

const withValue = ({
                       name = p => p.name,
                       store,
                       clearOnUnmount,
                        defaultValue,
    
                        // output props:
                       valueProp,
                       setValueProp,
                       pathProp,
                   } = EMPTY_OBJECT) => (BaseComponent) => {
    const factory = createEagerFactory(BaseComponent);

    class NewComponent extends React.PureComponent {
        static displayName = wrapDisplayName(BaseComponent, 'withValue');

        // private store;
        // private path;
        // private unsub;

        static contextTypes = {
            [ContextPath]: PathShape,
            [ContextStore]: StoreShape,
        };

        static childContextTypes = {
            [ContextPath]: PathShape,
        };

        getChildContext() {
            return {[ContextPath]: this.dataPath};
        }

        constructor(props, context) {
            super(props);
            this.store = (store && resolveValue(store, this.props)) || (context && context[ContextStore]) || defaultStore;
            const basePath = (context && context[ContextPath]) || EMPTY_ARRAY;
            const componentName = name !== undefined ? resolveValue(name, this.props) : undefined;
            let componentPath = componentName ? toPath(componentName) : [ShortId.generate()];
            // fixme: should we assign a rand name?
            
            this.dataPath = [...basePath, ...componentPath];
            this.fullPath = [DATA_ROOT, ...this.dataPath];
            
            this.clearOnUnmount = clearOnUnmount !== undefined ? clearOnUnmount : !componentName;
            // console.log('this.fullPath',this.fullPath);
            
            const currentValue = getValue(this.store, this.fullPath);
            
            if(valueProp) {
                this.state = {
                    value: currentValue
                }
            }
            
            if(defaultValue !== undefined && currentValue === undefined) {
                // not entirely sure if we want to support this feature yet
                setValue(this.store, this.fullPath, defaultValue);
                pubSub.publish(this.fullPath);
            }
        }

        setValue = value => {
            const oldValue = getValue(this.store, this.fullPath);
            if(oldValue !== value) {
                setValue(this.store, this.fullPath, value);
                pubSub.publish(this.fullPath);
            }
        };

        render() {

            let props = {
                ...this.props,
            };
            if(valueProp) {
                props[valueProp] = this.state.value;
            }
            if(setValueProp) {
                props[setValueProp] = this.setValue;
            }
            if(pathProp) {
                props[pathProp] = this.fullPath;
            }
            // console.log('withValue.render',props.value,BaseComponent.displayName);
            return factory(props);
        }

        componentWillMount() {
            if(setValueProp) {
                this.unsub = pubSub.subscribe(this.fullPath, () => {
                    this.setState({
                        value: getValue(this.store, this.fullPath)
                    });
                });
            }
        }
        
        componentWillUnmount() {
            if(setValueProp) {
                this.unsub();
            }
            if(this.clearOnUnmount) {
                if(unset(this.store, this.fullPath)) {
                    pubSub.publish(this.fullPath);
                }
            }
        }
    }

    return NewComponent;
};

export default withValue;