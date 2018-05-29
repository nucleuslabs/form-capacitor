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
import {isString,isBoolean,isNumber} from '../lib/types';
import {length as getStringLength} from 'stringz';
import {delMap, setMap, getValue, setOrDel, getMap, spliceMap} from './util';

const observeMap = {
    object() {
        
    }
}

function watchObservable(jsonSchema, mobxStateTree) {
    
}

function watchProp() {
    
}


export function watchForErrors(schema, data) {
    const errors = observable.map();
    const dispose = watchForErrorsR(schema, data, undefined, errors, []);
    return {errors,dispose};
}

function watchForErrorsR(schema, obj, propName, errors, errorPath) {
    const disposers = [];
    const value = propName === undefined ? obj : getValue(obj,[propName]);
    
    switch(schema.type) {
        case 'object':
            // console.log('obj',mobxStateTree,propName,value)
            disposers.push(doObserve(value,() => {
                // console.log('object',value);
                const missingRequiredProps = [];
                for(let p of schema.required) {
                    if(value[p] === undefined) {
                        missingRequiredProps.push(p);
                    }
                }
                setOrDel(errors,missingRequiredProps.length,[...errorPath,'required'],missingRequiredProps)
            }))
            if(schema.properties) {
                for(let p of Object.keys(schema.properties)) {
                    const dispose = watchForErrorsR(schema.properties[p], value, p, errors, [...errorPath, 'properties', p]);
                    disposers.push(dispose);
                }
            }
            break;
        case 'string':
            if(!propName) throw new Error("Cannot watch primitive string");
            disposers.push(doObserve(obj,propName,value => {
                if(!isString(value)) {
                    setMap(errors,[...errorPath],observable.map([['type','string']]));
                    return;
                }else {
                    delMap(errors,[...errorPath,'type'])
                }
                const len = getStringLength(value);
                
                setOrDel(errors,isNumber(schema.minLength) && len < schema.minLength,[...errorPath,'minLength'],schema.minLength)
                setOrDel(errors,isNumber(schema.maxLength) && len > schema.maxLength,[...errorPath,'maxLength'],schema.maxLength)
                setOrDel(errors,isString(schema.pattern) && !(new RegExp(schema.pattern)).test(value),[...errorPath,'pattern'],schema.pattern)
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

            // const itemErrors = observable.array();
            // errors.set('items',itemErrors);
            const rowDisposers = [];

            for(let i=0; i<value.length; ++i) {
                rowDisposers[i] = watchForErrorsR(schema.items, value, i, errors, [...errorPath, 'items', i]);
            }
            disposers.push(doObserve(value,change => {
                // console.log('arrchange',change);
                if(change.addedCount) {
                    const end = change.index + change.addedCount;
                    for(let i=change.index; i<end; ++i) {
                        rowDisposers[i] = watchForErrorsR(schema.items,value,i,errors,[...errorPath, 'items', i]);
                    }
                } else if(change.removedCount) {
                    
                    
                    
                    // const end = change.index + change.removedCount;
                    // console.log('splicing',change.index,change.removedCount,disposers.length);
                    // itemErrors.splice(change.index,change.removedCount);
                    // const end = change.index + change.removedCount;
                    // for(let i=change.index; i<end; ++i) {
                    //     // fixme: gotta shift errors up...
                    //     delMap(errors,[...errorPath, 'items', i]);
                    // }
                    // console.log('change',change)
                    const itemErrors = getMap(errors,[...errorPath,'items']);
                    
                    if(itemErrors) {
                        const lastKey = Math.max(...itemErrors.keys());
                        const end = change.index + change.removedCount;
                        console.log(change.index,end,lastKey);
                        for(let i=change.index; i<=lastKey; ++i) {
                            // console.log('disposing',i);
                            rowDisposers[i]();
                            const err = itemErrors.get(i);
                            if(err) {
                                itemErrors.delete(i);
                                if(i >= end) {
                                    const newIdx = i-change.removedCount;
                                    err.set(newIdx, err);
                                    rowDisposers[newIdx] = watchForErrorsR(schema.items,value,newIdx,errors,[...errorPath, 'items', newIdx]);
                                }
                            }
                        }
                        
                        // spliceMap(itemErrors,change.index,change.removedCount);
                    }
                    // const del = rowDisposers.splice(change.index, change.removedCount);
                    // console.log('del',del);
                    // execAll(del);
                    // console.log(itemErrors.length);

                }
            }));

            disposers.push(() => execAll(rowDisposers));
            break;
        case 'number':
            if(!propName) throw new Error("Cannot watch primitive number");
            // console.log(mobxStateTree,propName);
            disposers.push(doObserve(obj,propName,value => {
                // console.log('number change',mobxStateTree,propName,change);

                if(!Number.isFinite(value)) {
                    setMap(errors,[...errorPath],observable.map([['type','number']]));
                    return;
                }else {
                    delMap(errors,[...errorPath,'type'])
                }
                // checkNumber(schema,value,errors);
            }));
            break;
        case 'integer':
            if(!propName) throw new Error("Cannot watch primitive integer");
            // console.log(mobxStateTree,propName);
            disposers.push(doObserve(obj,propName,value => {
                // console.log('number change',mobxStateTree,propName,change);
                
                if(!Number.isInteger(value)) {
                    setMap(errors,[...errorPath],observable.map([['type','integer']]));
                    return;
                } else {
                    delMap(errors,[...errorPath,'type'])
                }
                // checkNumber(schema,value,errors);
            }));
            break;
        case 'boolean':
            if(!propName) throw new Error("Cannot watch primitive boolean");
            // console.log(mobxStateTree,propName);
            disposers.push(doObserve(obj,propName,value => {
                // console.log('number change',mobxStateTree,propName,change);

                if(!isBoolean(value)) {
                    setMap(errors,[...errorPath],observable.map([['type','boolean']]));
                    return;
                }
            }));
            break;
        // default:
        //     throw new Error(`'${schema.type}' not supported`);
    }
    return () => execAll(disposers);
}

export function watchForErrorsBak(schema, mobxStateTree, propName) {
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
    if(isNumber(schema.exclusiveMinimum)) {
        // this changed from a bool to a number in draft 6: https://github.com/spacetelescope/understanding-json-schema/pull/66
        if(value <= schema.exclusiveMinimum) {
            errors.set('exclusiveMinimum',schema.exclusiveMinimum);
        }
    }
    if(isNumber(schema.exclusiveMaximum)) {
        if(value >= schema.exclusiveMaximum) {
            errors.set('exclusiveMaximum',schema.exclusiveMaximum);
        }
    }
    if(isNumber(schema.minimum)) {
        // console.log('heyyy',schema.minimum);
        if(schema.exclusiveMinimum === true) {
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
    if(isNumber(schema.maximum)) {
        if(schema.exclusiveMaximum === true) {
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
    if(isNumber(schema.multipleOf)) {
        if(value % schema.multipleOf !== 0) {
            errors.set('multipleOf',schema.multipleOf);
        }
    }
}

let obsCount = 0;

function doObserve(mobxStateTree,propName,change) {
    
    if(change === undefined) {
        change = propName;
        propName = undefined;
    }
    console.log(`++observe ${++obsCount}`,propName)
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
    // change = action(change);
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
        console.log(`--observe ${--obsCount}`)
        dispose();
    }
}

function unbox(mstNode) {
    return mstNode.value;
}

function exec(f) {
    f();
}