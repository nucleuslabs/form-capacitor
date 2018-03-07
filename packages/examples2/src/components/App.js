import {Fragment} from 'react';
import {Title, Container, SubTitle} from './bulma';
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import HomePage from './pages/HomePage';
import PersonForm from './pages/PersonForm';
import SchedulingInstructionsForm from './pages/SchedulingInstructionsForm';
import ErrorBoundary from './ErrorBoundary';
import routes from './routes';
import NotFound from './pages/NotFound';

export default function App() {

    return (
        <BrowserRouter onUpdate={() => window.scrollTo(0, 0)}>
            <Container>
                <div><Link to="/">&laquo; form-capacitor</Link></div>

                <ErrorBoundary>
                    <Switch>
                        {routes.reduce((acc, route) => {
                            if(route.component) {
                                acc.push(<Route key={route.url} exact path={route.url} component={route.component}/>)
                            }
                            return acc;
                        }, [])}
                        <Route exact path="/" component={HomePage}/>
                        <Route component={NotFound}/>
                    </Switch>
                </ErrorBoundary>
            </Container>
        </BrowserRouter>
    )
}