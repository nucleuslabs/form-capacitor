import {Provider} from 'react-redux';
import {withProps} from 'recompose';
import {createStore, combineReducers} from 'redux';
import namespace from './namespace';
import createReducer from './createReducer';

export default withProps(props => ({
    store: createStore(
        combineReducers({
            [namespace]: createReducer(),
        }),
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    )
}))(Provider);