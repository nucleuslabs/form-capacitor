import {resolveValue,setValue,toPath,getValue} from './util';
import {observer} from 'mobx-react';
import {observable,action,runInAction,isObservable,extendObservable} from 'mobx';
import {CTX_KEY, CTX_TYPES} from './consts';
import {getDisplayName} from '../lib/react';

export default function connect({
    propName = undefined,
}) {
    
    return Component => {
        // const ObserverComponent = observer(Component);
        let displayName;

        if(process.env.NODE_ENV !== 'production') {
            displayName = getDisplayName(Component);
        }

        const WrappedComponent = class extends Component {
            static contextTypes = CTX_TYPES;
            
        
            
            constructor(props,context) {
                super(props,context);
                
                // let _defaultValue = resolveValue.call(this, defaultValue, props);
                let _propName = resolveValue.call(this, propName, props);

                extendObservable(this, {
                    [_propName]: context[CTX_KEY],
                });
                
        
            }

            // render() {
            //     // console.log('rennddder', this._data.instructions[0]);
            //     let props;
            //     if(propName) {
            //         props = {...this.props, [propName]: this._data};
            //     } else {
            //         props = this.props;
            //     }
            //     return React.createElement(ObserverComponent, props);
            // }
        }

        if(process.env.NODE_ENV !== 'production') {
            WrappedComponent.displayName = `@connect(${displayName})`;
        }
        
        return observer(WrappedComponent);
    }
}