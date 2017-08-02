import React from 'react';
import ReactDOM from 'react-dom';
import ExamplesNav from './ExamplesNav';
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import PersonForm from './PersonForm';

ReactDOM.render(
    <BrowserRouter>
        <div className="container">
            <h3><Link to="/" className="text-muted">form-capacitor</Link></h3>
            <Switch>
                <Route exact path="/" component={ExamplesNav}/>
                <Route exact path="/person" component={PersonForm}/>
            </Switch>
        </div>
    </BrowserRouter>,
    document.getElementById('react-root')
);