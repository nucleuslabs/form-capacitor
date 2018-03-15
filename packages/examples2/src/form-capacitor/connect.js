import {resolveValue,setValue,toPath,getValue} from './util';
import {observer} from 'mobx-react';
import {observable,action,runInAction,isObservable,extendObservable,observe as addObserve} from 'mobx';
import {CTX_KEY, CTX_TYPES} from './consts';
import {getDisplayName} from '../lib/react';

export default function connect({
    propName = undefined,
    observe = undefined,
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
                if(propName) {
                    let _propName = resolveValue.call(this, propName, props);

                    // let obs = context[CTX_KEY];
                    
                    // this[_propName] = context[CTX_KEY];
                    
                    Object.defineProperty(this, _propName, {
                        get() {
                            return context[CTX_KEY].get();
                        },
                        set(value) {
                            context[CTX_KEY].set(value)
                        }
                    })
                    
                    // extendObservable(this, {
                    //     [_propName]: context[CTX_KEY], // screws up radio menus because each radio gets its own copy which doesnt actually change
                    // });

                    // addObserve(this,_propName,change => {
                    //     console.log('heyyyy',change.newValue);
                    //     obs.set(change.newValue);
                    // });
                } else if(observe) {
                    throw new Error('not supported');
                    addObserve(context[CTX_KEY],change => {
                        observe.call(this,change);
                    });
                }

             
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