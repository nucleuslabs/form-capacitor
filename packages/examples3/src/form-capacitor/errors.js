import {
    autorun,
    observable,
    action,
    runInAction,
    isObservable,
    extendObservable,
    observe,
    toJS,
    isBoxedObservable, 
    isObservableArray,
    isObservableObject,
    reaction
} from 'mobx';
import {isString} from '../lib/types';


const observeMap = {
    object() {
        
    }
}

function watchObservable(jsonSchema, mobxStateTree) {
    
}

function watchProp() {
    
}

export function watchForErrors(schema, mobxStateTree, propName) {
    const errors = observable.map();
    let value = mobxStateTree;
    if(propName !== undefined) {
        // console.log('value',value, propName, value[propName]);
        value = value[propName];
    }
    switch(schema.type) {
        case 'object':
            // console.log('obj',mobxStateTree,propName,value)
            doObserve(value,newValue => {
                // console.log('object',value);
                const missingRequiredProps = [];
                for(let p of schema.required) {
                    if(value[p] === undefined) {
                        missingRequiredProps.push(p);
                    }
                }
                if(missingRequiredProps.length) {
                    errors.set('required',missingRequiredProps);
                } else {
                    errors.delete('required');
                }
            })
            if(schema.properties) {
                const propErrors = observable.map();
                errors.set('properties',propErrors);
                for(let p of Object.keys(schema.properties)) {
                    propErrors.set(p, watchForErrors(schema.properties[p], value, p));
                }
            }
            break;
        case 'string':
            doObserve(mobxStateTree,propName,value => {
                errors.clear();
                if(!isString(value)) {
                    errors.set('type','string');
                    return;
                }
                if(schema.minLength != null && value.length < schema.minLength) {
                    errors.set('minLength',schema.minLength);
                }
                if(schema.maxLength != null && value.length > schema.maxLength) {
                    errors.set('maxLength',schema.maxLength);
                }
                if(schema.pattern != null) {
                    const re = new RegExp(schema.pattern);
                    if(!re.test(value)) {
                        errors.set('pattern', schema.pattern)
                    }
                }
                if(schema.format != null) {
                    throw new Error(`"format" rule not implemented`);
                }
            });
            break;
        case 'array':
            // console.log('arr',mobxStateTree,propName);
            // if(propName) {
            //     mobxStateTree = mobxStateTree[propName];
            // }
            // const disposers = [];
            // console.log('arrayyy',mobxStateTree,propName);

            const itemErrors = observable.map();
            errors.set('items',itemErrors);
            
            for(let i=0; i<value.length; ++i) {
                // TODO: how to dispose observer when this item is deleted...?
                // --> watchForErrors should return {errors, dispose}, where
                // dispose disposes all observers + descendants; schema.js
                // will dispose on unmount
                itemErrors.set(i, watchForErrors(schema.items,value,i));
            }
            doObserve(value,value => {
                console.log('array change',value);
            });
            break;
        case 'number':
            // console.log(mobxStateTree,propName);
            doObserve(mobxStateTree,propName,value => {
               // console.log('number change',mobxStateTree,propName,change);

                errors.clear();
                if(!Number.isFinite(value)) {
                    errors.set('type','number');
                    return;
                }
                checkNumber(schema,value,errors);
            });
            break;
    }
    return errors;
}

function checkNumber(schema,value,errors) {
    if(schema.minimum != null) {
        // console.log('heyyy',schema.minimum);
        if(schema.exclusiveMinimum) {
            if(value <= schema.minimum) {
                errors.set('minimum',schema.minimum);
                errors.set('exclusiveMinimum',schema.exclusiveMinimum);}
        } else {
            if(value < schema.minimum) {
                errors.set('minimum',schema.minimum);
            }
        }
    }
    if(schema.maximum != null) {
        if(schema.exclusiveMaximum) {
            if(value >= schema.maximum) {
                errors.set('maximum',schema.maximum);
                errors.set('exclusiveMaximum',schema.exclusiveMaximum);}
        } else {
            if(value > schema.maximum) {
                errors.set('maximum',schema.maximum);
            }
        }
    }
    if(schema.multipleOf != null) {
        if(value % schema.multipleOf !== 0) {
            errors.set('multipleOf',schema.multipleOf);
        }
    }
}

function doObserve(mobxStateTree,propName,change) {
    if(change === undefined) {
        change = propName;
        propName = undefined;
    }
    // if(propName === undefined) {
    //     return observe(mobxStateTree,c => change(c.newValue.value));
    // }
    // if(isObservableArray(mobxStateTree)) {
    //     throw new Error("cant handle arrays atm");
    //     console.log('observing array',mobxStateTree,propName);
    //     return reaction(() => mobxStateTree[propName], (...args) => {
    //         console.log('reaction',mobxStateTree,propName,args);
    //         change(...args);
    //     });
    // }
    // let handler = c => c.newValue.value;
    // if(isObervableObject())
    change(propName !== undefined ? mobxStateTree[propName] : mobxStateTree);
    return observe(mobxStateTree,propName,c => {
        // console.log(c.type);
        switch(c.type) {
            case 'splice':
                change({
                    ...c,
                    added: c.added.map(unbox),
                    removed: c.removed.map(unbox),
                });
                break;
            case 'update':
                change(c.newValue.value)
                break;
            default:
                throw new Error(`unhandled change type ${c.type}`);
        }
        
    });
}

function unbox(mstNode) {
    return mstNode.value;
}