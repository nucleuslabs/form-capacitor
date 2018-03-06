import React from 'react';
import cc from 'classcat';

export function classFactory(className, modifiers) {
    const modSet = modifiers ? new Set(Object.keys(modifiers)) : null;

    return function makeProps({className: extraClass, ...extraProps}) {
        let classes = [];
        let props = extraProps;

        if(className) {
            classes.push(className);
        }
        if(modSet) {
            props = Object.create(null);
            for(const p of Object.keys(extraProps)) {
                if(modSet.has(p)) {
                    if(extraProps[p]) {
                        classes.push(modifiers[p]);
                    }
                } else {
                    props[p] = extraProps[p];
                }
            }
        }
        if(extraClass) {
            classes.push(extraClass);
        }
        if(classes.length) {
            props.className = cc(classes);
        }
        return props;
    }
}

export function withClass(component, className, modifiers) {
    const factory = classFactory(className, modifiers);
    const wrapped = props => React.createElement(component, factory(props));
    if(process.env.NODE_ENV !== 'production') {
        wrapped.displayName = getDisplayName(component);
        if(className) wrapped.displayName += `.${cc(className).replace(/ /g, '.')}`;
    }
    return wrapped;
}

export function withProps(component, defaultProps) {
    const wrapped = props => React.createElement(component, {...defaultProps, ...props});
    if(process.env.NODE_ENV !== 'production') {
        wrapped.displayName = shallowStringify(defaultProps);
    }
    return wrapped;
}

function shallowStringify(obj) {
    return Object.keys(obj).map(key => `${key}=${shortValue(obj[key])}`).join(',');
}

function shortValue(value) {
    if(Array.isArray(value)) {
        return `[${value.length}]`;
    }
    if(value === undefined) {
        return 'undef';
    }
    if(value === null) {
        return 'null';
    }
    if(typeof value === 'string') {
        return JSON.stringify(value.length <= 15 ? value :  value.slice(0,14)+'…');
    }
    if(value instanceof RegExp || typeof value === 'number') {
        return String(value);
    }
    if(value instanceof Date) {
        return value.toISOString();
    }
    return `{${Object.keys(value).length}}`;
}

export function getDisplayName(Component) {
    // https://github.com/acdlite/recompose/blob/929decab9e5babda15e388bbb3bc25f81371b32e/src/packages/recompose/getDisplayName.js
    if(typeof Component === 'string') {
        return Component
    }

    if(!Component) {
        return undefined
    }

    return Component.displayName || Component.name || 'Component'
}