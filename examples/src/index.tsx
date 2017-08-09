import React from 'react';
import ReactDOM from 'react-dom';
import ExamplesNav from './ExamplesNav';
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import PersonForm from './PersonForm';
import {createReducer} from 'form-capacitor';
import {createStore, combineReducers, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import {compose} from 'recompose';
import SchedulingInstructionsForm from './SchedulingInstructionsForm';

/**
 * Logs all actions and states after they are dispatched.
 */
const logger = store => next => action => {
    console.group(action.type);
    console.info('dispatching', action);
    let result = next(action);
    console.log('next state', store.getState());
    console.groupEnd(action.type);
    return result
};

let middleware = [/*logger*/];

const composeEnhancers =
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
            // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
            serialize: true
        }) : compose;

const enhancer = composeEnhancers(
    applyMiddleware(...middleware),
    // other store enhancers if any
);

const store = createStore(
    combineReducers({
        formCapacitor: createReducer(),
    }),
    enhancer
);


ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter>
            <div className="container">
                <div><Link to="/">&laquo; form-capacitor</Link></div>
                <Switch>
                    <Route exact path="/" component={ExamplesNav}/>
                    <Route exact path="/person" render={() => <PersonForm name="person"/>}/>
                    <Route exact path="/scheduling" component={SchedulingInstructionsForm}/>
                </Switch>
            </div>
        </BrowserRouter>
    </Provider>,
    document.getElementById('react-root')
);