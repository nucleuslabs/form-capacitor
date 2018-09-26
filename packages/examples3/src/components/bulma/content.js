import React from 'react';
import css from './bulma.scss';
import {withClass, withProps} from '../../lib/react';
import {Link as RouterLink} from 'react-router-dom';
import elem from './factory';
// https://bulma.io/documentation/elements/content/

export const Content = withClass('div',css.content)


import {Icon} from './index';
import externalLinkIcon from '../../icons/fa/solid/external-link-alt.svg';


export const Para = elem('p');
export const Code = ({children}) => <pre><code>{children}</code></pre>;

export const InternalLink = elem(RouterLink);

const Link = elem('a',null,null,{href: ''});

// export const ExternalLink = withProps(Link, {hasTextDanger: true, target: '_blank'});

export class ActionLink extends React.Component {
    
    clickHandler = ev => {
        ev.preventDefault();
        if(this.props.onClick) {
            this.props.onClick.call(this, ev)
        }
    }
    
    render() {
        return <Link {...this.props} onClick={this.clickHandler}/>
    }
}

export function ExternalLink({children,...props}) {
    return <Link target="_blank" {...props}>{children}<Icon className={css['external-link-icon']} src={externalLinkIcon}/></Link>
}