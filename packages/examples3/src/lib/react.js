import React from 'react';
import cc from 'classcat';
import {shallowEqual} from 'shouldcomponentupdate-children';

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

// export function withDisplayName(displayName, component) {
//     if(process.env.NODE_ENV !== 'production') {
//         // TODO: fix forwardRefs
//         component.displayName = displayName;
//     }
//     return component;
// }
// export function wrapDisplayName(prefix, wrappedComponent, newComponent) {
//     if(process.env.NODE_ENV !== 'production') {
//         // TODO: fix forwardRefs
//         const componentDisplayName = getDisplayName(wrappedComponent);
//         newComponent.displayName = `${prefix}(${componentDisplayName})`;
//     }
//     return newComponent;
// }

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

export function splitAria(props) {
    let aria = Object.create(null);
    let notAria = Object.create(null);
    for(let key of Object.keys(props)) {
        if(key.startsWith('aria-')) {
            aria[key] = props[key];
        } else {
            notAria[key] = props[key];
        }
    }
    return [aria, notAria];
}

export function scuChildren(nextProps, nextState) {
    const shouldUpdate = shallowEqual(this.props, nextProps, this.state, nextState);
    
    if(shouldUpdate) {
        const props = new Set([...Object.keys(this.props),...Object.keys(nextProps)]);
        
        // let id = nextProps.id || nextProps.name || nextProps.key || getDisplayName(this);
        //
        // if(Array.isArray(id)) {
        //     id = id.join('.');
        // }
     
        // console.group(id);
        for(let p of props) {
            if(this.props[p] !== nextProps[p]) {
                // console.log(p,this.props[p],'!==',nextProps[p])
                return true;
                // console.log(`%c${p} %c${this.props[p]} %c!== %c${nextProps[p]}`,'color:green','','color:magenta','');
            }
        }
        // console.groupEnd();
        // console.log(nextProps.name,this.props===nextProps,this.props,nextProps,this.state===nextState,this.state,nextState);
    }
    return shouldUpdate;
}