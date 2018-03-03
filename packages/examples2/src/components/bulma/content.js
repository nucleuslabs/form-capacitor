import React from 'react';
import css from './bulma.scss';
import {classFactory, withClass, withProps} from '../../lib/react';
import cc from 'classcat';
import {Link as RouterLink} from 'react-router-dom';

// https://bulma.io/documentation/elements/content/

export const Content = withClass('div',css.content)

import modifiers from './modifiers';
import {Icon} from './index';
import externalLinkIcon from '../../icons/fa/regular/external-link.svg';

const bulmaPropFactory = classFactory(null, modifiers);


function bulmaElement(el) {
    return function withModifiers(props) {
        return React.createElement(el, bulmaPropFactory(props));
    }
}

export const Para = bulmaElement('p');
export const Code = ({children}) => <pre><code>{children}</code></pre>;

export const InternalLink = bulmaElement(RouterLink);

const Link = withProps(bulmaElement('a'),{href: ''});

// export const ExternalLink = withProps(Link, {hasTextDanger: true, target: '_blank'});



export function ExternalLink({children,...props}) {
    return <Link target="_blank" {...props}>{children}<Icon className={css['external-link-icon']} src={externalLinkIcon}/></Link>
}