import React from 'react';
import css from './bulma.scss';
import {classFactory, withClass} from '../../lib/react';
import cc from 'classcat';

export const Content = withClass('div',css.content)
export const Container = withClass('div',css.container)

export * from './Title';
export * from './Form';

const iconFactory = classFactory(css.icon, {
    isSmall: css['is-small'],
    isLeft: css['is-left'],
    isRight: css['is-right'],
});

export function Icon({src,...props}) {
    return <span {...iconFactory(props)} dangerouslySetInnerHTML={{__html:src}}/>
}