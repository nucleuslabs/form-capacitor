import React from 'react';
import {Link} from 'react-router-dom';
import {Title} from './bulma';

export default function ExamplesNav() {
    return (
        <div>
            <Title>Examples</Title>
            <ul>
                <li><Link to="/person">Person Form</Link> &ndash; various input types</li>
                {/*<li><Link to="/person2">Person Form</Link> &ndash; xxxxxxxxxxxxxx</li>*/}
                <li><Link to="/scheduling">Scheduling Instructions</Link> &ndash; repeatable form elements</li>
                <li><Link to="/dnd">Drag-n-Drop</Link> &ndash; exotic widgets</li>
                <li><Link to="/sign-up">Sign Up Form</Link> &ndash; complex validation rules</li>
                <li><Link to="/github">Github</Link> &ndash; async validation</li>
            </ul>
        </div>
    )
}