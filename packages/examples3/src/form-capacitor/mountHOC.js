import {resolveValue, setValue, toPath, getValue, isObject, toObservable} from './util';
import {observer} from 'mobx-react';
import {observable,action,runInAction,isObservable,isBoxedObservable,toJS,extendObservable,observe,autorun} from 'mobx';
import {STORE_KEY, PATH_KEY, CTX_TYPES} from './consts';
import {getDisplayName} from '../lib/react';

export default function mount(options) {
    options = Object.assign({
        path: ({name}) => name,
        defaultValue: null,
    }, options)
    
    return Component => {
        let displayName = getDisplayName(Component);
        
        const WrappedComponent = class extends React.Component {
            static childContextTypes = CTX_TYPES;
            static contextTypes = CTX_TYPES;

            getChildContext() {
                return {
                    [STORE_KEY]: this._data,
                    [PATH_KEY]: this._path,
                }
            }

            constructor(props,context) {
                super(props,context);
                
                let defaultValue = resolveValue.call(this, options.defaultValue, props);
                
                if(context[STORE_KEY] && options.path) {
                    this._data = context[STORE_KEY];
                    this._path = toPath(resolveValue.call(this, options.path, props));
                    if(context[PATH_KEY]) {
                        this._path = [...context[PATH_KEY], ...this._path];
                    }
                    let value = getValue(context[STORE_KEY], this._path);
                    // console.log(_path,value);
                    if(value === undefined) {
                        value = defaultValue;
                    }
                    
                    // console.log('setting',context[STORE_KEY],this._path);
                    runInAction(() => setValue(context[STORE_KEY], this._path, value));
                } else {
                    this._data = observable.box(defaultValue, displayName);
                    this._path = [];
                }
            }

            render() {
                return React.createElement(Component, this.props);
            }
        }

        if(process.env.NODE_ENV !== 'production') {
            WrappedComponent.displayName = `@mount(${displayName})`;
        }

        return WrappedComponent;
    }
}