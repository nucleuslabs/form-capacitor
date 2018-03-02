import React from 'react';
import cc from 'classcat';

export function withClass(el, className, modifiers) {
    const modSet = modifiers ? new Set(Object.keys(modifiers)) : null;

    return function withClass({className: extraClass, ...extraProps}) {
        let classes = [];
        let props;

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
        } else {
            props = {...extraProps};
        }
        if(extraClass) {
            classes.push(extraClass);
        }
        if(classes.length) {
            props.className = cc(classes);
        }
        return React.createElement(el, props);
    }
}

export function withProps(component, defaultProps) {
    return function withProps(props) {
        return React.createElement(component, {...defaultProps, ...props});
    }
}