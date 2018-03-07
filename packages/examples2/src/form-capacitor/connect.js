import {resolveValue,setValue,toPath,getValue} from './util';
import {observer} from 'mobx-react';
import {observable,action,runInAction,isObservable} from 'mobx';
import {CTX_KEY, CTX_TYPES} from './consts';
import {getDisplayName} from '../lib/react';

export default function connect({
    propName = undefined,
    initialValue = Object.create(null),
    mountPoint = undefined,
}) {
    
    return Component => {
        const ObserverComponent = observer(Component);

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
                
                let resolvedValue = resolveValue.call(this, initialValue, props);
                
                if(context[CTX_KEY] && mountPoint) {
                    let path = resolveValue.call(this, mountPoint, props);
                    if(path) {
                        path = toPath(path);
                        let currentValue = getValue(context[CTX_KEY], path);
                        
                        if(isObservable(currentValue)) {
                            this._data = currentValue;
                        } else {
                            if(currentValue === undefined) {
                                currentValue = resolvedValue;
                            }
                            this._data = observable(currentValue);
                            runInAction(() => setValue(context[CTX_KEY], toPath(path), this._data));
                        }
                    }
                } else {
                    this._data = observable(resolvedValue);
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
            WrappedComponent.displayName = `@connect(${getDisplayName(Component)})`;
        }
        
        return WrappedComponent;
    }
}