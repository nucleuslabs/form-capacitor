import React from 'react';
import css from './bulma.scss';
import {classFactory} from '../../lib/react';
import modifiers from './modifiers';

// https://bulma.io/documentation/elements/icon/

const iconFactory = classFactory(css.icon, {
    ...modifiers,
    isSmall: css['is-small'],
});

export function Icon({src,...props}) {
    return <span {...iconFactory(props)} dangerouslySetInnerHTML={{__html:src}}/>
}