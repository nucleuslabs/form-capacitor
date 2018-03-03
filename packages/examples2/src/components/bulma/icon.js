import React from 'react';
import css from './bulma.scss';
import {classFactory} from '../../lib/react';
import modifiers from './modifiers';

// https://bulma.io/documentation/elements/icon/

const iconFactory = classFactory(css.icon, {
    ...modifiers,
    isSmall: css.isSmall,
    isMedium: css.isMedium,
    isLarge: css.isLarge,
    isLeft: css.isLeft,
    isRight: css.isRight,
});


// fixme: need to give some more thought to sizing. bulma allows you to size the container + icon independently: https://bulma.io/documentation/elements/icon/#sizes
export function Icon({src,...props}) {
    return <span {...iconFactory(props)} dangerouslySetInnerHTML={{__html:src}}/>
}