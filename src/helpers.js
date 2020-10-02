import stringToPath from './stringToPath';
// import {isBoxedObservable,isObservable,observable,extendObservable,isObservableProp,isObservableObject,isObservableArray,isObservableMap, set as mobSet} from 'mobx';
import {isBoxedObservable, isObservable, observable, isObservableProp, isObservableObject, isObservableArray, isObservableMap, isObservableSet} from 'mobx';
import projectSettings from '../package.json';
// export function setDefaults(obj, defaults, overwrite) {
//     for(let key of Object.keys(defaults)) {
//         if(obj[key] === undefined) {
//             obj[key] = defaults[key];
//         }
//     }
// }

export const EMPTY_ARRAY = Object.freeze([]);
export const EMPTY_OBJECT = Object.freeze(Object.create(null));
export const EMPTY_MAP = Object.freeze(new Map); // warning: this doesn't actually prevent anyone from setting things; see https://stackoverflow.com/a/35776333/65387
export const EMPTY_SET = Object.freeze(new Set);
export const PROJECT_NAME_VERSION = `${projectSettings.name} v${projectSettings.version}`;
export const CONSOLE_WARNING_PREFIX = `${PROJECT_NAME_VERSION} : `;

// export const NO_OP = Object.freeze(() => {});

/**
 * Unwraps a value. If passed a function, evaluates that function with the provided args. Otherwise, returns the value as-is.
 *
 * @param {Function|*} functionOrValue Function or value
 * @param {*} args Arguments to pass if `functionOrValue` is a function
 * @returns {*} The value passed in or the result of calling the function
 */
export function resolveValue(functionOrValue, ...args) {
    return isFunction(functionOrValue) ? functionOrValue.call(this, ...args) : functionOrValue;
}

/**
 * returns only true if obj is a core js functions not user created js functions
 * @param {any} obj
 * @returns {boolean}
 */
export function isNativeFunction(obj) {
    return isFunction(obj) && obj.toString().endsWith('{ [native code] }');
}

/**
 * returns true if obj is a function
 * @param {any} obj
 * @returns {boolean}
 */
export function isFunction(obj) {
    return typeof obj === 'function';
}

/**
 * returns true if object is a string
 * @param {any} obj
 * @returns {boolean}
 */
export function isString(obj) {
    return typeof obj === 'string' || obj instanceof String;
}

/**
 * returns true if object is a number
 * @param {any} obj
 * @returns {boolean}
 */
export function isNumber(obj) {
    return typeof obj === 'number' || obj instanceof Number;
}

/**
 * returns true if obj is a promise
 * @param {any} obj
 * @returns {boolean}
 */
export function isPromise(obj) {
    return obj instanceof Promise;
}

/**
 * returns true if obj is strictly either true or false
 * @param {any} obj
 * @returns {boolean}
 */
export function isBoolean(obj) {
    return obj === true || obj === false; // there's also a `Boolean` type but it doesn't behave much like a boolean
}

/**
 * returns true if obj is a regular expression
 * @param {any} obj
 * @returns {boolean}
 */
export function isRegExp(obj) {
    return obj instanceof RegExp;
}

/**
 * returns true if obj is a native JS date object
 * @param {any} obj
 * @returns {boolean}
 */
export function isDate(obj) {
    return obj instanceof Date;
}

/**
 * returns true if obj is a Set or an ObservableSet
 * @param {any} obj
 * @returns {boolean}
 */
export function isSetLike(obj) {
    return obj instanceof Set || isObservableSet(obj);
}

/**
 * returns true if obj is a Map, a WeakMap or an ObservableMap
 * @param {any} obj
 * @returns {boolean}
 */
export function isMapLike(obj) {
    return obj instanceof Map || obj instanceof WeakMap || isObservableMap(obj);
}

/**
 * returns true if obj is an Array or an ObservableArray
 * @param {any} obj
 * @returns {boolean}
 */
export function isArrayLike(obj) {
    return Array.isArray(obj) || isObservableArray(obj);
}

/**
 * returns true if obj is an Object
 * @param {{}} obj
 * @returns {boolean|boolean}
 */
export function isObject(obj) {
    return obj !== null && typeof obj === 'object';
}

/**
 * returns true if obj is a WeakMap
 * @param {any} obj
 * @returns {boolean}
 */
export function isWeakMap(obj) {
    return obj instanceof WeakMap;
}

/**
 * returns true if obj is null
 * @param {any} obj
 * @returns {boolean}
 */
export function isNull(obj) {
    return obj === null;
}

/**
 * returns true if obj is undefined
 * @param {any} obj
 * @returns {boolean}
 */
export function isUndefined(obj) {
    return obj === undefined;
}

/**
 * Returns true if a value is null, undefined, or NaN.
 *
 * @param {*} obj
 * @returns {boolean}
 */
export function isNullish(obj) {
    return obj === null || obj === undefined;
}

/**
 * returns true if obj is a POJO
 * @param {any} obj
 * @returns {boolean}
 */
export function isPlainObject(obj) {
    return Object.prototype.toString.call(obj) === "[object Object]";
}

/**
 * returns true if obj is a Symbol Object
 * @param {any} obj
 * @returns {boolean}
 */
export function isSymbol(obj) {
    return typeof obj === 'symbol';
}

/**
 * returns true if obj is an Error
 * @param {any} obj
 * @returns {boolean}
 */
export function isError(obj) {
    return obj instanceof Error;
}

/**
 * returns true if the obj is either a string that looks like an int or an actual int
 * @param {any} obj
 * @returns {boolean}
 */
/* istanbul ignore next */
export function isIntLoose(obj) {
    return (typeof obj === 'string' && /^(0|[1-9][0-9]*)$/.test(obj))
        || (Number.isFinite(obj) && ~~obj === obj);
}

/**
 * returns true if the obj is an int
 * @param {any} obj
 * @returns {boolean|boolean}
 */
/* istanbul ignore next */
export function isInt(obj) {
    return isNumber(obj) && (Number.isFinite(obj) && ~~obj === obj);
}

/**
 * sets a value in obj given a path compatible with observable objects and arrays
 * @param {{}} obj
 * @param {string|string[]} path
 * @param {any} value
 */
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
    for(let i = 0; i < end; ++i) {
        const key = path[i];
        const path1 = path[i + 1];
        if(Object.isExtensible(obj[key])) {
            // Primitives like null, undefined, numbers and booleans will be overwritten
            // because they can't be extended. frozen or sealed objects will also be
            // overwritten. Objects, arrays, functions, regular expressions, Dates and more will
            // have new properties added.
        } else if(isIntLoose(path1)) {
            setProperty(obj, key, new Array(parseInt(path1, 10) + 1));
        } else {
            setProperty(obj, key, Object.create(null));
        }
        if(isObservableObject(obj)) {
            if(!isObservableProp(obj, key)) {
                throw new Error(`Property '${path.slice(0, i + 1).join('.')}' is not observable`);
            }
        } else if(!isObservableArray(obj)) {
            throw new Error(`Cannot add property '${path.slice(0, i + 1).join('.')}' to non-observable`);
        }
        obj = obj[key];
    }
    // console.log('setting',obj,'@',path[end],'to',value);
    setProperty(obj, path[end], isFunction(value) ? value(obj[path[end]]) : value);
}

/**
 * Sets a value for a given path in an ObservableMap
 * @param {Map} map
 * @param {string|string[]} path
 * @param {any} value
 * @returns {*}
 */
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

/**
 * returns a value from an ObservableMap at given path or def
 * @param {Map} map
 * @param {string|string[]} path
 * @param {any} def default value
 * @returns {*}
 */
export function getMap(map, path, def) {
    if(!isObservableMap(map)) {
        throw new Error(`getMap only works on observable maps`);
    }
    path = toPath(path);
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

/**
 * Sets or deletes a value in a map depending on the condition expression
 * @param {Map} map
 * @param {expression} condition
 * @param {string|string[]} path
 * @param {any} value
 * @returns {boolean}
 */
export function setOrDel(map, condition, path, value) {
    if(condition) {
        setMap(map, path, value);
        return true;
    } else {
        delMap(map, path);
        return false;
    }
}

/**
 * deletes node from an ObservableMap
 * @param {Map} map
 * @param {string|string[]} path
 * @returns {boolean}
 */
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

/**
 * recursively deletes nodes from an ObservableMap
 * @param {Map} map
 * @param {string|string[]} path
 * @returns {boolean}
 */
/* istanbul ignore next */
function delMapR(map, path) {
    if(path.length > 1) {
        const [first, ...rest] = path;
        const next = map.get(first);
        if(!next) return false;
        const deleted = delMapR(next, rest);
        if(!next.size) map.delete(first);
        return deleted;
    }
    if(path.length > 0) {
        return map.delete(path[0]);
    }
    return false;
}

/**
 * sets properties within ObservableArrays and ObservableObjects
 * @param {{}} obj
 * @param {string} key
 * @param {any} value
 */
/* istanbul ignore next */
function setProperty(obj, key, value) {
    if(isObservableObject(obj)) {
        if(isObservableProp(obj, key)) {
            // console.log('already obs');
            obj[key] = value;
        } else {
            throw new Error(`Cannot add property '${key}' to object; changes wouldn't be tracked`);
        }
    } else if(isObservableArray(obj)) {
        obj[key] = value;
    } else {
        throw new Error(`Cannot set property '${key}' on non-observable`);
    }
}

/**
 *
 * @param {string | string[]} value
 * @returns {string[]}
 */
export function toPath(value) {
    if(Array.isArray(value)) {
        return value;
    }
    return stringToPath(value);
}

/**
 * returns teh value at a given path in an Object/Map Tree or def
 * @param {{}} obj
 * @param {string|string[]} path
 * @param {any} [def = undefined] default value
 * @returns {*}
 */
export function getValue(obj, path, def = undefined) {
    if(!obj) return def;
    if(isBoxedObservable(obj)) {
        obj = obj.get();
    }
    if(!Array.isArray(path)) {
        path = stringToPath(path);
    }
    let ret = obj;

    for(let key of path) {
        if(isMapLike(ret)) {
            ret = ret.get(key);
        } else if(isArrayLike(ret) && ret.length <= key) {
            return def;
        } else {
            ret = ret[key];
        }
        if(ret === undefined) {
            return def;
        }
    }
    return ret;
}

/**
 * converts a value to an observable value
 * @param {any} obj
 * @returns {any}
 */
export function toObservable(obj) {
    return isObject(obj) && !isObservable(obj) ? observable(obj) : (isString(obj) || isNumber(obj) ? observable.box(obj) : obj);
}

/**
 * grab observables without converting them to values
 * @param {{}|Map} obj
 * @param {string|string[]} path
 * @returns {undefined|*}
 */
export function getObservable(obj, path) {
    if(!obj) return undefined;
    if(!Array.isArray(path)) {
        path = stringToPath(path);
    }
    let ret = obj;

    for(let key of path) {
        if(isMapLike(ret)) {
            ret = ret.get(key);
        } else {
            ret = ret[key];
        }
    }

    return ret;
}