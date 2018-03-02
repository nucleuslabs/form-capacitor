import React from 'react';
import css from './bulma.scss';
import {withClass} from '../../lib/react';
import cc from 'classcat';

export const Content = withClass('div',css.content)
export const Container = withClass('div',css.container)
// export const Icon = withClass('span',css.icon,{
//     small: css['is-small'],
//     left: css['is-left'],
//     right: css['is-right'],
// })

export * from './Title';
export * from './Form';

export function Icon({src,className}) {
    return <span className={cc([css.icon,className])} dangerouslySetInnerHTML={{__html:src}}/>
}