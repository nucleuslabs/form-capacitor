import {resolveValue, setValue, toPath, getValue, toObservable} from './util';
import {observer} from 'mobx-react';
import {
    autorun,
    observable,
    action,
    runInAction,
    isObservable,
    extendObservable,
    observe as addObserve,
    toJS,
    isBoxedObservable
} from 'mobx';
import {STORE_KEY, PATH_KEY, CTX_TYPES} from './consts';
import {getDisplayName} from '../lib/react';
import $RefParser from 'json-schema-ref-parser'; // https://github.com/BigstickCarpet/json-schema-ref-parser/blob/master/docs/refs.md#getref
import {isNumber, isString} from '../lib/types';

function unique(arr) {
    return Array.from(new Set(arr));
}

function keys(obj) {
    return obj ? Object.keys(obj) : [];
}

function hasProp(obj,key) {
    return Object.hasOwnProperty.call(obj,key);
}

function resolveDefaultValue(schema) {
    if(!schema) throw new Error(`Missing schema`);
    if(schema.type === 'object') {
        if(schema.additionalProperties) {
            throw new Error("`additionalProperties` is not supported due to mobx constraint");
        }
        const properties = unique([...keys(schema.properties), ...schema.required]);
        const required = schema.required ? new Set(schema.required) : new Set;
        const defaultValue = Object.create(null);
        for(let p of properties) {
            if(required.has(p)) {
                defaultValue[p] = resolveDefaultValue(schema.properties[p]);
            } else {
                defaultValue[p] = undefined;
            }
        }
        if(hasProp(schema,'default')) {
            Object.assign(defaultValue, schema.default);
        }
        // console.log('defaultValue',defaultValue);
        return defaultValue;
    }
    if(Object.hasOwnProperty.call(schema,'default')) {
        return schema.default;
    }
    switch(schema.type) {
        case 'array':
            // TODO: resolve all elements in the array if it contains objects...?
            return [];
        case 'string':
            return '';
        case 'boolean':
            return false;
        case 'null':
            return null;
        case 'integer':
        case 'number':
            return 0;
    }
    throw new Error(`Unsupported JSON Schema type "${schema.type}"`);
}

function bindErrorHandlers(schema, value, errMap={}) {
    // console.log('bind',schema,value);
    switch(schema.type) {
        case 'object':
            if(schema.required) {
                addObserve(value,change => {
                    // console.log('obs',value,change);
                    const missingRequiredProps = [];
                    for(let p of schema.required) {
                        if(change.object[p] === undefined) {
                            missingRequiredProps.push(p);
                        }
                    }
                    if(missingRequiredProps.length) {
                        errMap.set('required',missingRequiredProps);
                    } else {
                        errMap.delete('required');
                    }
                    // errMap.set('required',missingRequiredProps.length ? missingRequiredProps : false);
                    // console.log('missingRequiredProps',missingRequiredProps);
                })
            }
            if(schema.properties) {
                let propErrors = observable.map();
                errMap.set('properties',propErrors);
                for(let p of Object.keys(schema.properties)) {
                    // console.log(value,p);
                    
                    let ppErr = observable.map();
                    propErrors.set(p, ppErr);
                    
                    const propSchema = schema.properties[p];
                    
                    addObserve(value, p, change => checkTypeErrors(propSchema,change,ppErr), false)
                    // bindErrorHandlers(schema.properties[p], value[p]);
                }
            }
            break;
    }
}

function checkTypeErrors(schema,change,errors) {
    errors.clear();
    return checkProp[schema.type](schema,change,errors);
}

const checkProp = {
    string(schema,change,errors) {
        if(!isString(change.newValue)) {
            errors.set('type','string');
            return;
        }
        if(schema.minLength != null && change.newValue.length < schema.minLength) {
            // FIXME: what the heck do we put here..?
            errors.set('minLength',schema.minLength);
        } 
        if(schema.maxLength != null && change.newValue.length > schema.maxLength) {
            errors.set('maxLength',schema.maxLength);
        } 
        if(schema.pattern != null) {
            const re = new RegExp(schema.pattern);
            if(!re.test(change.newValue)) {
                errors.set('pattern', schema.pattern)
            } 
        } 
        if(schema.format != null) {
            throw new Error(`"format" rule not implemented`);
        }
    },
    number(schema,change,errors) {
        if(!isNumber(change.newValue)) {
            errors.set('type','number');
            return;
        }
        return checkNumber(schema,change,errors);
    },
    integer(schema,change,errors) {
        if(!isNumber(change.newValue) || !Number.isFinite(change.newValue) || change.newValue < Number.MIN_SAFE_INTEGER || change.newValue > Number.MAX_SAFE_INTEGER || change.newValue % 1 !== 0) {
            errors.set('type','integer');
            return;
        }
        
        return checkNumber(schema,change,errors);
    }
}

function checkNumber(schema,change,errors) {
    if(schema.minimum != null) {
        if(schema.exclusiveMinimum) {
            if(change.newValue <= schema.minimum) {
                errors.set('minimum',schema.minimum);
                errors.set('exclusiveMinimum',schema.exclusiveMinimum);}
        } else {
            if(change.newValue < schema.minimum) {
                errors.set('minimum',schema.minimum);
            }
        }
    }
    if(schema.maximum != null) {
        if(schema.exclusiveMaximum) {
            if(change.newValue >= schema.maximum) {
                errors.set('maximum',schema.maximum);
                errors.set('exclusiveMaximum',schema.exclusiveMaximum);}
        } else {
            if(change.newValue > schema.maximum) {
                errors.set('maximum',schema.maximum);
            }
        }
    }
    if(schema.multipleOf != null) {
        if(change.newValue % schema.multipleOf !== 0) {
            errors.set('multipleOf',schema.multipleOf);
        }
    }
}

export default function schema(options) {
    options = Object.assign({
        schema: undefined,
        $ref: undefined,
    }, options)

    const parser = new $RefParser();
    let schemaPromise = parser.dereference(options.schema);

    if(options.$ref) {
        schemaPromise = schemaPromise.then(() => parser.$refs.get(options.$ref));
    }

    return Component => {
        // let schemaPromise = $RefParser.resolve(options.schema)
        //    
        // if(options.$ref) {
        //     schemaPromise = schemaPromise.then($refs => $refs.get(options.$ref));
        // }
        //
        // schemaPromise = schemaPromise.then(schema => $RefParser.dereference(schema));
        // // schemaPromise = schemaPromise.then($refs => $refs.get(options.$ref));
        // schemaPromise.then(schema => console.log('defaultValue',resolveDefaultValue(schema)));
        
        const WrappedComponent = class extends Component {


            constructor(props, context) {
                super(props, context);
                
                // import $RefParser from 'json-schema-ref-parser'; // https://github.com/BigstickCarpet/json-schema-ref-parser/blob/master/docs/refs.md#getref

                // const store = getValue(context[STORE_KEY], context[PATH_KEY])

                const errorMap = observable.map();
                

                Object.defineProperty(this, 'errorMap', {
                    get() {
                        return errorMap;
                    },
                    // set(value) {
                    //     setValue(context[STORE_KEY],context[PATH_KEY],value);
                    // }
                })
                
                // extendObservable(this, {
                //     get errorMap() {
                //         return toJS(errorMap);
                //     }
                // })
                
               
                
                schemaPromise.then(action(schema => {
                    const defaultValue = resolveDefaultValue(schema);
                    setValue(context[STORE_KEY], context[PATH_KEY], defaultValue)

                    bindErrorHandlers(schema, getValue(context[STORE_KEY], context[PATH_KEY]), errorMap);
                }));
                
                
                
                // runInAction(() => setValue(context[STORE_KEY], this._path, value));
                // console.log(store.set);

                
                // console.log(props,context,options,store);
            }


            // render() {
            //     return React.createElement(Component, this.props);
            // }
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
            const displayName = getDisplayName(Component);
            WrappedComponent.displayName = `@schema(${displayName})`;
        }

        return observer(WrappedComponent);
    }
}