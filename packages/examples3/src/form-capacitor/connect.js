import {resolveValue, setValue, toPath, getValue, toObservable} from './util';
import {observer} from 'mobx-react';
import {observable,action,runInAction,isObservable,extendObservable,observe as addObserve,toJS,isBoxedObservable} from 'mobx';
import {STORE_KEY,PATH_KEY, CTX_TYPES} from './consts';
import {getDisplayName} from '../lib/react';

export default function connect(options) {
    options = Object.assign({
        propName: undefined,
        observe: undefined,
    }, options)
    
    return Component => {
        // const ObserverComponent = observer(Component);
        let displayName;

        if(process.env.NODE_ENV !== 'production') {
            displayName = getDisplayName(Component);
        }

        const WrappedComponent = class extends Component {
        
            
            constructor(props,context) {
                super(props,context);
                
                // let _defaultValue = resolveValue.call(this, defaultValue, props);
                if(options.propName) {
                    let _propName = resolveValue.call(this, options.propName, props);

                    // let obs = context[CTX_KEY];
                    
                    // this[_propName] = context[CTX_KEY];
                    
                    Object.defineProperty(this, _propName, {
                        get() {
                            return getValue(context[STORE_KEY], context[PATH_KEY]);
                        },
                        set(value) {
                            setValue(context[STORE_KEY],context[PATH_KEY],value);
                        }
                    })
                    
                    
                    
                    // extendObservable(this, {
                    //     [_propName]: context[CTX_KEY], // screws up radio menus because each radio gets its own copy which doesnt actually change
                    // });

                    // addObserve(this,_propName,change => {
                    //     console.log('heyyyy',change.newValue);
                    //     obs.set(change.newValue);
                    // });
                } else if(options.observe) {
                    throw new Error('not supported');
                    addObserve(context[STORE_KEY], change => {
                        options.observe.call(this,change);
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

        WrappedComponent.contextTypes = {...CTX_TYPES, ...Component.contextTypes};

        if(process.env.NODE_ENV !== 'production') {
            WrappedComponent.displayName = `@connect(${displayName})`;
        }
        
        return observer(WrappedComponent);
    }
}