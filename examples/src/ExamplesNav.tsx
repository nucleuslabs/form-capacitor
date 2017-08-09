import React from 'react';
import {Link} from 'react-router-dom';
import {Title} from './bulma';

export default function ExamplesNav() {
    return (
        <div>
            <Title>Examples</Title>
            <ul>
                <li><Link to="/person">Person Form</Link></li>
                <li><Link to="/scheduling">Scheduling Instructions</Link></li>
            </ul>
        </div>
    )
}