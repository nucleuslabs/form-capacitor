import {resolveValue,setValue,toPath,getValue} from './util';
import {observer} from 'mobx-react';
import {observable,action,runInAction,isObservable,toJS,extendObservable,observe,autorun} from 'mobx';
import {CTX_KEY, CTX_TYPES} from './consts';
import {getDisplayName} from '../lib/react';

export default function mount({
    path = ({name}) => name,
    defaultValue = () => Object.create(null),
}) {
    return Component => {
        let displayName;

        if(process.env.NODE_ENV !== 'production') {
            displayName = getDisplayName(Component);
        }

        const WrappedComponent = class extends React.Component {
            static childContextTypes = CTX_TYPES;
            static contextTypes = CTX_TYPES;

            getChildContext() {
                return {
                    [CTX_KEY]: this._data
                }
            }

            constructor(props,context) {
                super(props,context);

             
                let _defaultValue = resolveValue.call(this, defaultValue, props);
                let value = _defaultValue;
                
                if(context[CTX_KEY] && path) {
                    let _path = toPath(resolveValue.call(this, path, props));
                    value = getValue(context[CTX_KEY], _path);
                    // console.log(_path,value);
                    if(value === undefined) {
                        value = _defaultValue;
                    }

                    this._data = observable.box(value, `${displayName}#${_path.join('.')}`);
                    // runInAction(() => setValue(context[CTX_KEY], _path, this._data));

                    // autorun(() => setValue(context[CTX_KEY], _path, this._data))

                    // runInAction(() => setValue(context[CTX_KEY], _path, value));
                    
                    observe(this._data, change => {
                        console.log('they see me firin');
                        setValue(context[CTX_KEY], _path, change.newValue);
                        // console.log('this.data',change)
                    })
                } else {

                    this._data = observable.box(value, displayName);
                }

              
                
                // extendObservable(this, {
                //     _data: value,
                // })
                // this._data = observable(_defa)

                // if(context[CTX_KEY] && name) {
                //     let path = resolveValue.call(this, name, props);
                //     if(!path) throw new Error(`name does not resolve to a valid path`);
                //     path = toPath(path);
                //     let currentValue = getValue(context[CTX_KEY], path);
                //     // console.log('currentValue',currentValue,toJS(context[CTX_KEY]),path,getValue(context[CTX_KEY], ['instructions']));
                //
                //     if(currentValue === undefined) {
                //         currentValue = _defaultValue;
                //     }
                //     this._data = observable.box(currentValue, `${displayName}#${path.join('.')}`);
                //     runInAction(() => setValue(context[CTX_KEY], path, this._data));
                // } else {
                //     this._data = observable.box(_defaultValue, displayName);
                // }
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