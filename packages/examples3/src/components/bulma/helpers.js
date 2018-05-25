import {classFactory, getDisplayName} from '../../lib/react';
import css from './bulma.scss';

export function withBulmaClass(component, className, modifiers) {
    if(className) {
        if(!Array.isArray(className)) {
            className = [className];
        }
    } else {
        className = [];
    }
    const factory = classFactory(className.map(c => css[c]), modifiers);
    const wrapped = props => React.createElement(component, factory(props));
    if(process.env.NODE_ENV !== 'production') {
        wrapped.displayName = getDisplayName(component);
        if(className.length) wrapped.displayName += `.${className.join('.')}`;
    }
    return wrapped;
}