import defaultStore from './defaultStore';
import {ContextStore, StoreShape} from './context';
import React from 'react';

export default class FormStoreProvider extends React.PureComponent {

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