const {Provider} = require('react-redux');
const {withProps} = require('recompose');
const {createStore} = require('redux');
const createReducer = require('./createReducer');

module.exports = withProps(props => ({
    store: createStore(
        createReducer(props.initialState || {}), 
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    )
}))(Provider);