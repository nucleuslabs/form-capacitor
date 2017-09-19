import defaultStore from './defaultStore';
import {ContextStore, StoreShape} from './context';
import React, {ReactElement} from 'react';

export interface PropTypes {
    store?: object,
    children: ReactElement<any>,
}

export default class FormStoreProvider extends React.PureComponent<PropTypes> {

    static childContextTypes = {
        [ContextStore]: StoreShape,
    };

    getChildContext() {
        return {[ContextStore]: this.props.store || defaultStore};
    }
    
    render() {
        return this.props.children;
    }
}