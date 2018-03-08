import {resolveValue,setValue,toPath,getValue} from './util';
import {observer} from 'mobx-react';
import {observable,action,runInAction,isObservable,toJS} from 'mobx';
import {CTX_KEY, CTX_TYPES} from './consts';
import {getDisplayName} from '../lib/react';

export default function mount({
    name = ({name}) => name,
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

                let rDefaultValue = resolveValue.call(this, defaultValue, props);

                if(context[CTX_KEY] && name) {
                    let path = resolveValue.call(this, name, props);
                    if(!path) throw new Error(`name does not resolve to a valid path`);
                    path = toPath(path);
                    let currentValue = getValue(context[CTX_KEY], path);
                    // console.log('currentValue',currentValue,toJS(context[CTX_KEY]),path,getValue(context[CTX_KEY], ['instructions']));

                    if(currentValue === undefined) {
                        currentValue = rDefaultValue;
                    }
                    this._data = observable.box(currentValue, `${displayName}#${path.join('.')}`);
                    runInAction(() => setValue(context[CTX_KEY], path, this._data));
                } else {
                    this._data = observable.box(rDefaultValue, displayName);
                }
            }

            render() {
                return React.createElement(Component, this.props);
            }
        }

        if(process.env.NODE_ENV !== 'production') {
            WrappedComponent.displayName = `@connect(${displayName})`;
        }

        return WrappedComponent;
    }
}