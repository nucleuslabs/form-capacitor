import stringToPath from './stringToPath';
// import {isBoxedObservable,isObservable,observable,extendObservable,isObservableProp,isObservableObject,isObservableArray,isObservableMap, set as mobSet} from 'mobx';
import {isBoxedObservable,isObservable,observable,isObservableProp,isObservableObject,isObservableArray,isObservableMap} from 'mobx';

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
    path = toPath(path);
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
    setProperty(obj, path[end], typeof value === 'function' ? value(obj[path[end]]) : value)
}

export function setMap(map, path, value) {
    if(!isObservableMap(map)) {
        throw new Error(`setMap only works on observable maps`);
    }
    path = toPath(path);
    if(!path.length) {
        throw new Error("Cannot set root");
    }
    const end = path.length - 1;
    let it = map;
    for(let i = 0; i < end; ++i) {
        const key = path[i];
        if(it.has(key)) {
            it = it.get(key);
        } else {
            const next = observable.map();
            it.set(key, next);
            it = next;
        }
    }
    it.set(path[end], value);
    return map;
}

export function getMap(map, path, def) {
    if(!isObservableMap(map)) {
        throw new Error(`getMap only works on observable maps`);
    }
    path = toPath(path);
    if(!path.length) {
        throw new Error("Cannot set root");
    }
    for(let i = 0; i < path.length; ++i) {
        const key = path[i];
        if(map.has(key)) {
            map = map.get(key);
        } else {
            return def;
        }
    }
    return map;
}

export function spliceMap(map,index,count) {
    const end = index+count;
    for(const [key,val] of Array.from(map)) {
        if(key >= index) {
            map.delete(key);
            if(key >= end) {
                map.set(key - count, val);
            }
        }
    }
}

export function setOrDel(map, condition, path, value) {
    if(condition) {
        setMap(map,path,value);
        return true;
    } else {
        delMap(map,path);
        return false;
    }
}

export function delMap(map, path) {
    if(!isObservableMap(map)) {
        throw new Error(`delMap only works on observable maps`);
    }
    path = toPath(path);
    if(!path.length) {
        throw new Error("Cannot delete root");
    }
    return delMapR(map, path);
}


function delMapR(map, path) {
    if(path.length > 1) {
        const [first, ...rest] = path;
        const next = map.get(first);
        if(!next) return false;
        const deleted = delMapR(next, rest);
        if(!next.size) map.delete(first);
        return deleted;
    }
    return map.delete(path[0]);
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

        if(isMap(ret)) {
            ret = ret.get(key);
        } else {
            if(isArray(ret) && ret.length <= key){
                return def;
            } else {
                ret = ret[key];
            }
        }

        if(ret === undefined) {
            return def;
        }

    }
    return ret;
}

export function isMap(x) {
    return isObservableMap(x) || x instanceof Map || x instanceof WeakMap;
}

function isArray(x) {
    return isObservableArray(x) || Array.isArray(x);
}

export const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));

export function isObject(obj) {
    return obj !== null && typeof obj === 'object';
}

export function toObservable(obj) {
    return isObject(obj) && !isObservable(obj) ? observable(obj) : obj;
}

/**
 * Checks if two arrays are equivalent
 *
 * @param {array} arr1 First array
 * @param {array} arr2 Second array
 * @returns {boolean} True if arrays are equivalent, false otherwise
 * @link http://stackoverflow.com/a/14853974/65387
 */
export function arrayEquals(arr1, arr2) {
    if(!arr1 || !arr2 || arr1.length !== arr2.length) {
        return false;
    }

    for(let i = 0; i < arr1.length; ++i) {
        if(isArray(arr1[i]) && isArray(arr2[i])) {
            if(!arrayEquals(arr1[i], arr2[i])) {
                return false;
            }
        } else if(!Object.is(arr1[i], arr2[i])) {
            return false;
        }
    }
    return true;
}