import React, {createFactory} from 'react';
import {createEagerFactory, wrapDisplayName, shallowEqual} from 'recompact';
import {CTX_KEY_PATH, CTX_VAL_PATH} from 'form-capacitor-store';
import {resolveValue} from 'form-capacitor-util/util';


export default function mountPoint({add,expose}) { 
    
    return BaseComponent => {
        return class extends React.PureComponent {
            static displayName = wrapDisplayName(BaseComponent, 'mountPoint');

            static contextTypes = {
                [CTX_KEY_PATH]: CTX_VAL_PATH,
            };

            static childContextTypes = {
                [CTX_KEY_PATH]: CTX_VAL_PATH,
            };

            getChildContext() {
                return {[CTX_KEY_PATH]: this.path};
            }
            
            constructor(props, context) {
                super(props, context);
                
                const currentPath = (context && context[CTX_KEY_PATH]) || [];
                this.path = resolvePath(currentPath, resolveValue(add,this.props));
            }

            render() {
                let props;
                if(expose) {
                    if(expose === true) expose = 'path';
                    props = {
                        ...this.props,
                        [expose]: this.path,
                    }
                } else {
                    props = this.props;
                }
                return React.createElement(BaseComponent, props);
            }
        }
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
