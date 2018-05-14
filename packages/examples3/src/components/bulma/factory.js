import React from 'react';
import {classFactory, getDisplayName} from '../../lib/react';
import commonModifiers from './modifiers';
import cc from 'classcat';

export default function(component, className, modifiers, defaultProps) {
    const factory = classFactory(className, {...commonModifiers, ...modifiers});
    const wrapped = props => React.createElement(component, factory({...defaultProps, ...props}));
    if(process.env.NODE_ENV !== 'production') {
        wrapped.displayName = getDisplayName(component);
        if(className) wrapped.displayName += `.${cc(className).replace(/ /g, '.')}`;
    }
    return wrapped;
}