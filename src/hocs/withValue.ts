import React from 'react';
import {createEagerFactory, wrapDisplayName} from 'recompose';
import PropTypes from 'prop-types';
import {resolveValue,defaults} from '../util';
import {ContextStore, StoreShape, ContextPath, PathShape} from '../context';
import defaultStore from '../defaultStore';
import {get as getValue, set as setValue, toPath} from 'lodash';
import {EMPTY_ARRAY} from '../constants';
import pubSub from '../pubSub';
// import Lo from 'lodash';

export interface Options {
    nameProp?: string,
    name?: string|Function,
    storeProp?: string,
    store?: object,
    valueProp?: string,
    setValueProp?: string,
    pathProp?: string,
}

const withValue = ({
    nameProp, 
    name = p => p[nameProp], 
    storeProp, 
    store, 
    valueProp,
    setValueProp,
    pathProp,
}: Options) => (BaseComponent) => {
    const factory = createEagerFactory(BaseComponent);

    class NewComponent extends React.PureComponent {
        static displayName = wrapDisplayName(BaseComponent, 'withValue');
        
        private store: object;
        private path: string[];
        private unsub: () => void;

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
            this.store = (store && resolveValue(store,this.props)) || (storeProp && this.props[storeProp]) || (this.context && this.context[ContextStore]) || defaultStore;
            const basePath = (context && context[ContextPath]) || EMPTY_ARRAY;
            let componentPath = (name && resolveValue(name,this.props)) || (nameProp && this.props[nameProp]);
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
            setValue(this.store, this.path, value);
            pubSub.publish(this.path);
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
            }
        });
    }
    
    return NewComponent;
};

export default withValue;