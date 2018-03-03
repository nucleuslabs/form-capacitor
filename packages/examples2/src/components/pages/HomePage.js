import {Fragment} from 'react';
import {Title} from '../bulma';
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import routes from '../routes';
import {InternalLink} from '../bulma';

export default function HomePage() {
    
    return <Fragment>
        <Title>Examples</Title>
        <ul>
            {routes.map(route => (
                <li key={route.url}><InternalLink to={route.url} hasTextDanger={!route.component}>{route.name}</InternalLink>{!!route.desc && <Fragment> &ndash; {route.desc}</Fragment>}</li>
            ))}
        </ul>
    </Fragment>
}