import React from 'react';
import {createEagerFactory, wrapDisplayName, shallowEqual} from 'recompact';
import PropTypes from 'prop-types';
import {resolveValue, defaults, setValue} from 'form-capacitor-util/util';
import {ContextStore, StoreShape, CTX_KEY_PATH, CTX_VAL_PATH, DATA_ROOT} from 'form-capacitor-store';
import {defaultStore, pubSub} from 'form-capacitor-store';
import {get as getValue, toPath, unset} from 'lodash';
import {EMPTY_ARRAY, EMPTY_OBJECT} from './constants';
import ShortId from 'shortid';
// import Lo from 'lodash';

const withValue = ({
                       name = p => p.name,

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

        static contextTypes = {
            [CTX_KEY_PATH]: CTX_VAL_PATH,
        };

        static childContextTypes = {
            [CTX_KEY_PATH]: CTX_VAL_PATH,
        };

        getChildContext() {
            return {[CTX_KEY_PATH]: this.dataPath};
        }

        constructor(props, context) {
            super(props);

            const basePath = (context && context[CTX_KEY_PATH]) || EMPTY_ARRAY;
            const componentName = resolveValue(name, this.props);
            const componentPath = componentName ? toPath(componentName) : [ShortId.generate()];
            // fixme: should we assign a rand name?

            this.dataPath = [...basePath, ...componentPath];
            this.fullPath = [DATA_ROOT, ...this.dataPath];

            this.clearOnUnmount = clearOnUnmount !== undefined ? clearOnUnmount : !componentName;
            // console.log('this.fullPath',this.fullPath);

            let currentValue = pubSub.get(this.fullPath);

            if(defaultValue !== undefined && currentValue === undefined) {
                // not entirely sure if we want to support this feature yet
                pubSub.set(this.fullPath, defaultValue);
                currentValue = defaultValue;
            }

            // console.log('currentValue',currentValue);

            if(valueProp) {
                this.state = {
                    value: currentValue
                }
            }
        }

        setValue = value => {
            pubSub.set(this.fullPath, value);
        };

        render() {

            let props = {
                ...this.props,
            };
            if(valueProp) {
                props[valueProp] = this.state.value;
                // console.log('this.state',this.state);
                // console.log('props[valueProp]',props[valueProp]);
            }
            if(setValueProp) {
                props[setValueProp] = this.setValue;
            }
            if(pathProp) {
                props[pathProp] = this.dataPath;
            }
            // console.log('withValue.render',valueProp,props[valueProp],BaseComponent.displayName);
            return factory(props);
        }

        componentWillMount() {
            if(valueProp) {
                this.unsub = pubSub.subscribe(this.fullPath, value => {
                    // console.log(BaseComponent.displayName,'got change',getValue(this.store, this.fullPath));
                    // console.log('change',this.fullPath);
                    this.setState({value});
                });
            }
        }

        componentWillUnmount() {
            if(valueProp) {
                this.unsub();
            }
            if(this.clearOnUnmount) {
                pubSub.unset(this.fullPath);
            }
        }
    }

    return NewComponent;
};

export default withValue;