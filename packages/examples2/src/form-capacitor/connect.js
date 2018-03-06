import {resolveValue} from './util';
import {observer} from 'mobx-react';
import {observable} from 'mobx';
import {CTX_KEY, CTX_TYPES} from './consts';
import {getDisplayName} from '../lib/react';

export default function connect({
    propName = undefined,
    initialValue = Object.create(null),
}) {
    
    return Component => {
        const ObserverComponent = observer(Component);

        const WrappedComponent = class extends React.Component {
            static childContextTypes = CTX_TYPES;

            getChildContext() {
                return {
                    [CTX_KEY]: this._data
                }
            }

            constructor(props) {
                super(props);
                this._data = observable(resolveValue.call(this, initialValue, props));
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