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

export function withClass(el, className, modifiers) {
    const factory = classFactory(className, modifiers);
    return function withClass(props) {
        return React.createElement(el, factory(props));
    }
}

export function withProps(component, defaultProps) {
    return function withProps(props) {
        return React.createElement(component, {...defaultProps, ...props});
    }
}