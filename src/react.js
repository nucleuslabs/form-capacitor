import React from 'react';
import {shallowEqual} from 'shouldcomponentupdate-children';

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