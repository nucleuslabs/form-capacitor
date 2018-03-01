import {Fragment} from 'react';
import {Title} from 'reactbulma';
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';

export default function HomePage() {
    
    return <Fragment>
        <Title>Examples</Title>
        <ul>
            <li><Link to="/person">Person Form</Link> &ndash; various input types</li>
        </ul>
    </Fragment>
}