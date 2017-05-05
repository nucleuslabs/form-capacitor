const {Provider} = require('react-redux');
const {withProps} = require('recompose');
const {createStore, combineReducers} = require('redux');
const namespace = require('./namespace');
const createReducer = require('./createReducer');

module.exports = withProps(props => ({
    store: createStore(
        combineReducers({
            [namespace]: createReducer(props.data),
        }),
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    )
}))(Provider);