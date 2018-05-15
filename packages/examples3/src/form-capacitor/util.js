import stringToPath from './stringToPath';
import {isBoxedObservable,isObservable,observable,extendObservable,isObservableProp,isObservableObject,isObservableArray, set as mobSet} from 'mobx';

export function setDefaults(obj, defaults, overwrite) {
    for(let key of Object.keys(defaults)) {
        if(obj[key] === undefined) {
            obj[key] = defaults[key];
        }
    }
}

/**
 * Unwraps a value. If passed a function, evaluates that function with the provided args. Otherwise, returns the value as-is.
 *
 * @param {Function|*} functionOrValue Function or value
 * @param {*} args Arguments to pass if `functionOrValue` is a function
 * @returns {*} The value passed in or the result of calling the function
 */
export function resolveValue(functionOrValue, ...args) {
    return typeof functionOrValue === 'function' ? functionOrValue.call(this, ...args) : functionOrValue;
}

function isInt(obj) {
    return (typeof obj === 'string' && /^(0|[1-9][0-9]*)$/.test(obj))
        || (Number.isFinite(obj) && Math.trunc(obj) === obj);
}

export function setValue(obj, path, value) {
    if(!isObject(obj)) {
        throw new Error(`Cannot set property of non-object`);
    }
    if(isBoxedObservable(obj)) {
        if(!path.length) {
            obj.set(value);
            return;
        }
        obj = obj.get();
    } else if(!path.length) {
        throw new Error('Cannot set root of unboxed object');
    }
    const end = path.length - 1;
    for(let i=0; i<end; ++i) {
        const key = path[i];
        const path1 = path[i+1];
        if(Object.isExtensible(obj[key])) {
            // Primitives like null, undefined, numbers and booleans will be overwritten
            // because they can't be extended. frozen or sealed objects will also be
            // overwritten. Objets, arrays, functions, regexes, Dates and more will
            // have new properties added.
        } else if(isInt(path1)) {
            setProperty(obj, key, new Array(parseInt(path1,10)+1));
        } else {
            setProperty(obj, key, Object.create(null));
        }
        if(isObservableObject(obj)) {
            if(!isObservableProp(obj, key)) {
                throw new Error(`Property '${path.slice(0,i+1).join('.')}' is not observable`);
            }
        } else if(isObservableArray(obj)) {
            // good
        } else {
            throw new Error(`Cannot add property '${path.slice(0,i+1).join('.')}' to non-observable`);
        }
        obj = obj[key];
    }
    // console.log('setting',obj,'@',path[end],'to',value);
    setProperty(obj, path[end], value)
}

function setProperty(obj, key, value) {
    if(isObservableObject(obj)) {
        // console.log('oooooooooooo',obj);
        if(isObservableProp(obj, key)) {
            // console.log('already obs');
            obj[key] = value;
        } else {
            throw new Error(`Cannot add property '${key}' to object; changes wouldn't be tracked`)
        }
    } else if(isObservableArray(obj)) {
        obj[key] = value;
    } else {
        throw new Error(`Cannot set property '${key}' on non-observable`);
    }
}

export function toPath(value) {
    if (Array.isArray(value)) {
        return value;
    }
    return stringToPath(value);
}

export function getValue(obj, path, def) {
    if(!obj) return def;
    if(isBoxedObservable(obj)) {
        obj = obj.get();
    }
    if(!Array.isArray(path)) {
        path = stringToPath(path);
    }
    let ret = obj;

    for(let key of path) {
        // console.log(obj,ret,key,path);
        if(ret == null || ret[key] === undefined) {
            // console.log('key not found',ret,key);
            return def;
        }
        ret = ret[key];
    }
    // console.log(obj,path);

    return ret;
}

export const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));

export function isObject(obj) {
    return obj !== null && typeof obj === 'object';
}

export function toObservable(obj) {
    return isObject(obj) && !isObservable(obj) ? observable(obj) : obj;
}