import {Component} from 'react';
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
}

const withValue = ({
    nameProp, 
    name = p => p[nameProp], 
    storeProp, 
    store, 
    valueProp,
    setValueProp,
}: Options) => (BaseComponent) => {
    const factory = createEagerFactory(BaseComponent);

    return class extends Component {
        static displayName = wrapDisplayName(BaseComponent, 'withValue');
        
        private store: object;
        private path: string[];
        private unsub: () => void;

        static contextTypes = {
            [ContextPath]: PathShape,
            [ContextStore]: StoreShape,
        };
        
        constructor(props) {
            super(props);
            this.store = (store && resolveValue(store,this.props)) || (storeProp && this.props[storeProp]) || (this.context && this.context[ContextStore]) || defaultStore;
            const basePath = (this.context && this.context[ContextPath]) || EMPTY_ARRAY;
            let componentPath = (name && resolveValue(name,this.props)) || (nameProp && this.props[nameProp]);
            componentPath = componentPath ? toPath(componentPath) : EMPTY_ARRAY;
            // fixme: should we assign a rand name?
            this.path = [...basePath, ...componentPath];
        }

        componentWillMount() {
            this.unsub = pubSub.subscribe(this.path, () => {
                this.forceUpdate();
            });
        }
        
        componentWillUnmount() {
            this.unsub();
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
                props[valueProp] = getValue(this.store, this.path);
            }
            if(setValueProp) {
                props[setValueProp] = this.setValue;
            }
            return factory(props);
        }
    };
};

export default withValue;