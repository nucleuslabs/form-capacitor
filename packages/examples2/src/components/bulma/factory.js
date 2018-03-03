import React from 'react';
import {classFactory} from '../../lib/react';
import sharedModifiers from './modifiers';

export default function(el, className, modifiers, defaultProps) {
    const factory = classFactory(className, {...sharedModifiers, ...modifiers});
    return function withModifiers(props) {
        return React.createElement(el, factory({...defaultProps, ...props}));
    }
}