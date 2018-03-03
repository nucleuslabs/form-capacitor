import {Fragment} from 'react';
import {Title} from '../bulma';
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import routes from '../routes';

export default function HomePage() {
    
    return <Fragment>
        <Title>Examples</Title>
        <ul>
            {routes.map(route => (
                <li key={route.url}><Link to={route.url}>{route.name}</Link>{!!route.desc && <Fragment> &ndash; {route.desc}</Fragment>}</li>
            ))}
        </ul>
    </Fragment>
}