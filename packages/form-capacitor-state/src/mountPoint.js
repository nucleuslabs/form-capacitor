import React, {createFactory} from 'react';
import {createEagerFactory, wrapDisplayName, shallowEqual} from 'recompact';
import {CTX_KEY_PATH, CTX_VAL_PATH} from 'form-capacitor-store';
import {resolveValue} from 'form-capacitor-util/util';
import {EMPTY_ARRAY, EMPTY_OBJECT} from './constants';

/**
 * 
 * @param {string|function} options.add Append this name to the path
 * @param {boolean|string|function} options.expose Expose `path` under this property
 * @param {boolean} options.mount Add path to child context
 * @returns {function(*=)}
 */
export default function mountPoint(options) { // TODO: rename mount()?
    
    // TODO: rename these options something more clear...
    options = {
        add: undefined, 
        expose: undefined,
        mount: true,
        ...options,
    };
    
    return BaseComponent => {
        class Mount extends React.Component {
            static displayName = wrapDisplayName(BaseComponent, 'mountPoint');

            static contextTypes = {
                [CTX_KEY_PATH]: CTX_VAL_PATH,
            };

            static childContextTypes = {
                [CTX_KEY_PATH]: CTX_VAL_PATH,
            };

            getChildContext() {
                // console.log('getChildContext',this.path);
                return this.setContext ? {[CTX_KEY_PATH]: this.path} : EMPTY_OBJECT;
            }
            
            constructor(props, context) {
                super(props, context);
                
                const currentPath = (context && context[CTX_KEY_PATH]) || EMPTY_ARRAY;
                this.path = resolvePath(currentPath, resolveValue(options.add,this.props));
                this.setContext = !!resolveValue(options.mount, this.props);
                this.pathProp = resolveValue(options.expose, this.props);
                if(this.pathProp === true) this.pathProp = 'path';
            }

            // shouldComponentUpdate(nextProps, nextState) {
            //     // is this going to cause problems...?
            //     // I did this because changing any of the options after the component is mounted
            //     // is not supported
            //     // it seems to work just fine and stops a lot of calls to render()
            //     // nevermind...it's preventing the DirtyLabels from re-rendering... weird.
            //     // maybe because withDirty() uses forceRender?
            //     return false;
            // }
            
            render() {
                let props;
                if(this.pathProp) {
                    props = {
                        ...this.props,
                        [this.pathProp]: this.path,
                    }
                } else {
                    props = this.props;
                }
                return React.createElement(BaseComponent, props);
            }
        }

        // if(options.mount) {
        //     Mount.childContextTypes = {
        //         [CTX_KEY_PATH]: CTX_VAL_PATH,
        //     };
        // }
        
        return Mount;
    }
};

function resolvePath(base, add) {
    // TODO: what if element is legitimately named "$" or ".."? should we implement some kind of escaping?
    if(!add) {
        return base;
    }
    if(!Array.isArray(add)) {
        add = add.split(/(\.+)/).filter(s => s !== '');
    }
    if(!add.length) return base;
    let full;
    if(add[0] === '$') {
        full = add.slice(1);
    } else {
        full = [...base, ...add];
    }
    //console.log('full',base,add,full);
    let out = [];
    for(let p of full) {
        if(p === '.') {
            // nada
        } else if(/^\.+$/.test(p)) {
            //console.log(out,0,-p.length+1);
            out = out.slice(0,-p.length+1);
        } else {
            out.push(p);
        }
    }
    return out;
}
