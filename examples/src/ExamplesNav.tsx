import React from 'react';
import {Link} from 'react-router-dom';

export default function ExamplesNav() {
    return (
        <div>
            <h1>Examples</h1>
            <ul>
                <li><Link to="/person">Person Form</Link></li>
                <li><Link to="/scheduling">Scheduling Instructions</Link></li>
            </ul>
        </div>
    )
}