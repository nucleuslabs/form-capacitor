import React from 'react';
import {createEagerFactory, wrapDisplayName, shallowEqual} from 'recompact';
import PropTypes from 'prop-types';
import {resolveValue, defaults, setValue} from './util';
import {ContextStore, StoreShape, ContextPath, PathShape, DATA_ROOT} from './context';
import {defaultStore, pubSub} from 'form-capacitor-store';
import {get as getValue, toPath, unset} from 'lodash';
import {EMPTY_ARRAY,EMPTY_OBJECT} from './constants';
import ShortId from 'shortid';
// import Lo from 'lodash';

const withValue = ({
                       name = p => p.name,
                       store,
                       clearOnUnmount,
    
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
            return {[ContextPath]: this.path};
        }

        constructor(props, context) {
            super(props);
            this.store = (store && resolveValue(store, this.props)) || (context && context[ContextStore]) || defaultStore;
            const basePath = (context && context[ContextPath]) || [DATA_ROOT];
            const componentName = name !== undefined ? resolveValue(name, this.props) : undefined;
            let componentPath = componentName ? toPath(componentName) : [ShortId.generate()];
            // fixme: should we assign a rand name?
            this.path = [...basePath, ...componentPath];
            
            this.clearOnUnmount = clearOnUnmount !== undefined ? clearOnUnmount : !componentName;
            // console.log('this.path',this.path);
            if(valueProp) {
                this.state = {
                    value: getValue(this.store, this.path)
                }
            }
        }

        setValue = value => {
            const oldValue = getValue(this.store, this.path);
            if(oldValue !== value) {
                setValue(this.store, this.path, value);
                pubSub.publish(this.path);
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
                props[pathProp] = this.path;
            }
            // console.log('withValue.render',props.value,BaseComponent.displayName);
            return factory(props);
        }

        componentWillMount() {
            if(setValueProp) {
                this.unsub = pubSub.subscribe(this.path, () => {
                    this.setState({
                        value: getValue(this.store, this.path)
                    });
                });
            }
        }
        
        componentWillUnmount() {
            if(setValueProp) {
                this.unsub();
            }
            if(this.clearOnUnmount) {
                if(unset(this.store, this.path)) {
                    pubSub.publish(this.path);
                }
            }
        }
    }

    return NewComponent;
};

export default withValue;