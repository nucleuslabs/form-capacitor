import React from 'react';
import ReactDOM from 'react-dom';
import ExamplesNav from './ExamplesNav';
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import PersonForm from './PersonForm';
import {FormStoreProvider} from 'form-capacitor';
import SchedulingInstructionsForm from './SchedulingInstructionsForm';
import DragAndDropForm from './dnd/DragAndDropForm';
import SignUpForm from './SignUpForm';
import AsyncForm from './AsyncForm';


ReactDOM.render(
        <BrowserRouter>
            <div className="container">
                <div><Link to="/">&laquo; form-capacitor</Link></div>
                <Switch>
                    <Route exact path="/" component={ExamplesNav}/>
                    <Route exact path="/person" render={() => <PersonForm name="person"/>}/>
                    <Route exact path="/scheduling" component={SchedulingInstructionsForm}/>
                    <Route exact path="/dnd" component={DragAndDropForm}/>
                    <Route exact path="/sign-up" component={SignUpForm}/>
                    <Route exact path="/twitter" component={AsyncForm}/>
                </Switch>
            </div>
        </BrowserRouter>,
    document.getElementById('react-root')
);