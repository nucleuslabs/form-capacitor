import {Provider} from 'react-redux';
import {withProps} from 'recompose';
import {createStore, combineReducers, Store, applyMiddleware} from 'redux';
import namespace from './namespace';
import createReducer from './createReducer';
import {ComponentType} from 'react';

export default withProps(({serialize=true}) => ({
    store: createStore(
        combineReducers({
            [namespace]: createReducer(),
        }),
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__({serialize})
    )
}))(Provider as ComponentType<{ store: Store<any>; }>);

// https://github.com/reactjs/react-redux/blob/9434e4389809b5c5ab707571e07e4e5f01562087/src/components/Provider.js#L25