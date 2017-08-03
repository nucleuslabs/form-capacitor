import React from 'react';
import ReactDOM from 'react-dom';
import ExamplesNav from './ExamplesNav';
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import PersonForm from './PersonForm';
import {FormStoreProvider} from 'form-capacitor';

ReactDOM.render(
    <FormStoreProvider>
        <BrowserRouter>
            <div className="container">
                <h3><Link to="/" className="text-muted">form-capacitor</Link></h3>
                <Switch>
                    <Route exact path="/" component={ExamplesNav}/>
                    <Route exact path="/person" render={() => <PersonForm name="person"/>}/>
                </Switch>
            </div>
        </BrowserRouter>
    </FormStoreProvider>,
    document.getElementById('react-root')
);