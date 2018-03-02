import {Fragment} from 'react';
import {Title, Container, SubTitle} from './bulma';
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import HomePage from './pages/HomePage';
import PersonForm from './pages/PersonForm';

export default function App() {

    return (
        <BrowserRouter onUpdate={() => window.scrollTo(0, 0)}>
            <Container>
                <div><Link to="/">&laquo; form-capacitor</Link></div>
                
                <Switch>
                    <Route exact path="/" component={HomePage}/>
                    <Route exact path="/person" component={PersonForm}/>
                </Switch>
            </Container>
        </BrowserRouter>
    )
}