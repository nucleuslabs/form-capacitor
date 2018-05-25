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
import {isString,isBoolean} from '../lib/types';
import {length as getStringLength} from 'stringz';

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
    const disposers = [];
    let value = mobxStateTree;
    if(propName !== undefined) {
        // console.log('value',value, propName, value[propName]);
        value = value[propName];
    }
    switch(schema.type) {
        case 'object':
            // console.log('obj',mobxStateTree,propName,value)
            disposers.push(doObserve(value,newValue => {
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
            }))
            if(schema.properties) {
                const propErrors = observable.map();
                errors.set('properties',propErrors);
                for(let p of Object.keys(schema.properties)) {
                    const {errors,dispose} = watchForErrors(schema.properties[p], value, p); 
                    propErrors.set(p, errors);
                    disposers.push(dispose);
                }
            }
            break;
        case 'string':
            disposers.push(doObserve(mobxStateTree,propName,value => {
                errors.clear();
                if(!isString(value)) {
                    errors.set('type','string');
                    return;
                }
                const len = getStringLength(value);
                if(schema.minLength != null && len < schema.minLength) {
                    errors.set('minLength',schema.minLength);
                }
                if(schema.maxLength != null && len > schema.maxLength) {
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
            }));
            break;
        case 'array':
            // console.log('arr',mobxStateTree,propName);
            // if(propName) {
            //     mobxStateTree = mobxStateTree[propName];
            // }
            // const disposers = [];
            // console.log('arrayyy',mobxStateTree,propName);

            const itemErrors = observable.array();
            errors.set('items',itemErrors);
            const rowDisposers = [];
            
            for(let i=0; i<value.length; ++i) {
                const {errors,dispose} = watchForErrors(schema.items,value,i);
                itemErrors[i] = errors;
                rowDisposers[i] = dispose;
            }
            disposers.push(doObserve(value,change => {
                // console.log('arrchange',change);
                if(change.addedCount) {
                    const end = change.index + change.addedCount;
                    for(let i=change.index; i<end; ++i) {
                        const {errors,dispose} = watchForErrors(schema.items,value,i);
                        itemErrors[i] = errors;
                        rowDisposers[i] = dispose;
                    }
                } else if(change.removedCount) {
                    // const end = change.index + change.removedCount;
                    // console.log('splicing',change.index,change.removedCount,disposers.length);
                    itemErrors.splice(change.index,change.removedCount);
                    const del = rowDisposers.splice(change.index, change.removedCount);
                    // console.log('del',del);
                    execAll(del);
                    // console.log(itemErrors.length);
                    
                }
            }));

            disposers.push(() => execAll(rowDisposers));
            break;
        case 'number':
            // console.log(mobxStateTree,propName);
            disposers.push(doObserve(mobxStateTree,propName,value => {
               // console.log('number change',mobxStateTree,propName,change);

                errors.clear();
                if(!Number.isFinite(value)) {
                    errors.set('type','number');
                    return;
                }
                checkNumber(schema,value,errors);
            }));
            break;
        case 'integer':
            // console.log(mobxStateTree,propName);
            disposers.push(doObserve(mobxStateTree,propName,value => {
                // console.log('number change',mobxStateTree,propName,change);

                errors.clear();
                if(!Number.isInteger(value)) {
                    errors.set('type','integer');
                    return;
                }
                checkNumber(schema,value,errors);
            }));
            break;
        case 'boolean':
            // console.log(mobxStateTree,propName);
            disposers.push(doObserve(mobxStateTree,propName,value => {
                // console.log('number change',mobxStateTree,propName,change);

                errors.clear();
                if(!isBoolean(value)) {
                    errors.set('type','boolean');
                    return;
                }
            }));
            break;
        // default:
        //     throw new Error(`'${schema.type}' not supported`);
    }
    return {
        errors,
        dispose: () => execAll(disposers),
    };
}

function execAll(arrayOfFuncs) {
    return arrayOfFuncs.forEach(exec);
}

function checkNumber(schema,value,errors) {
    if(schema.minimum != null) {
        // console.log('heyyy',schema.minimum);
        if(schema.exclusiveMinimum) {
            if(value <= schema.minimum) {
                errors.set('minimum',schema.minimum);
                errors.set('exclusiveMinimum',schema.exclusiveMinimum);
            }
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
                errors.set('exclusiveMaximum',schema.exclusiveMaximum);
            }
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

// let obsCount = 0;

function doObserve(mobxStateTree,propName,change) {
    // console.log(`++observe ${++obsCount}`)
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
    const dispose = observe(mobxStateTree,propName,c => {
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
    
    return () => {
        // console.log(`--observe ${--obsCount}`)
        dispose();
    }
}

function unbox(mstNode) {
    return mstNode.value;
}

function exec(f) {
    f();
}