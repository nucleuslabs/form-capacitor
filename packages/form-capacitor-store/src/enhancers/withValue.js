import React from 'react';
import {createEagerFactory, wrapDisplayName, shallowEqual} from 'recompact';
import PropTypes from 'prop-types';
import {resolveValue, defaults, setValue} from '../util';
import {ContextStore, StoreShape, ContextPath, PathShape} from '../objects/context';
import defaultStore from '../objects/store';
import {get as getValue, toPath} from 'lodash';
import {EMPTY_ARRAY,EMPTY_OBJECT} from '../objects/constants';
import pubSub from '../objects/pubSub';
import ShortId from 'shortid';
// import Lo from 'lodash';

const withValue = ({
                       nameProp,
                       name = p => p[nameProp],
                       storeProp,
                       store,
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
            this.store = (store && resolveValue(store, this.props)) || (storeProp && this.props[storeProp]) || (context && context[ContextStore]) || defaultStore;
            const basePath = (context && context[ContextPath]) || EMPTY_ARRAY;
            let componentPath = (name && resolveValue(name, this.props)) || (nameProp && this.props[nameProp]) || ShortId.generate();
            componentPath = componentPath ? toPath(componentPath) : EMPTY_ARRAY;
            // fixme: should we assign a rand name?
            this.path = [...basePath, ...componentPath];
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
    }

    if(valueProp) {
        Object.assign(NewComponent.prototype, {
            componentWillMount() {
                this.unsub = pubSub.subscribe(this.path, () => {
                    this.setState({
                        value: getValue(this.store, this.path)
                    });
                });
            },
            componentWillUnmount() {
                this.unsub();
            },
        });
    }

    return NewComponent;
};

export default withValue;