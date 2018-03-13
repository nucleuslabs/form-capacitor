import {resolveValue,setValue,toPath,getValue} from './util';
import {observer} from 'mobx-react';
import {observable,action,runInAction,isObservable,extendObservable} from 'mobx';
import {CTX_KEY, CTX_TYPES} from './consts';
import {getDisplayName} from '../lib/react';

export default function connect({
    propName = undefined,
    defaultValue = Object.create(null),
    mountPoint = undefined,
}) {
    
    return Component => {
        const ObserverComponent = observer(Component);
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
                
                let reDefaultValue = resolveValue.call(this, defaultValue, props);
                
                if(context[CTX_KEY] && mountPoint) {
                    let path = resolveValue.call(this, mountPoint, props);
                    if(!path) throw new Error(`mountPoint does not resolve to a valid path`);
                    path = toPath(path);
                    let currentValue = getValue(context[CTX_KEY], path);
                    
                    if(currentValue === undefined) {
                        currentValue = reDefaultValue;
                    }
                    this._data = observable.box(currentValue, `${displayName}#${path.join('.')}`);
                    runInAction(() => setValue(context[CTX_KEY], path, this._data));
                } else {
                    this._data = observable.box(reDefaultValue, displayName);
                }
            }

            render() {
                // console.log('rennddder', this._data.instructions[0]);
                let props;
                if(propName) {
                    props = {...this.props, [propName]: this._data};
                } else {
                    props = this.props;
                }
                return React.createElement(ObserverComponent, props);
            }
        }

        if(process.env.NODE_ENV !== 'production') {
            WrappedComponent.displayName = `@connect(${displayName})`;
        }
        
        return WrappedComponent;
    }
}