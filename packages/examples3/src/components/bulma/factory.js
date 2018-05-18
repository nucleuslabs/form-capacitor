import React from 'react';
import {classFactory, getDisplayName} from '../../lib/react';
import commonModifiers from './modifiers';
import cc from 'classcat';

export default function(component, className, modifiers, defaultProps) {
    const factory = classFactory(className, {...commonModifiers, ...modifiers});
    const wrapped = (props,ref) => React.createElement(component, factory({...defaultProps, ...props, ref}));
    if(process.env.NODE_ENV !== 'production') {
        wrapped.displayName = getDisplayName(component);
        if(className) wrapped.displayName += `.${cc(className).replace(/ /g, '.')}`;
    }
    return React.forwardRef(wrapped);
}

