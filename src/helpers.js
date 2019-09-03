import stringToPath from './stringToPath';
// import {isBoxedObservable,isObservable,observable,extendObservable,isObservableProp,isObservableObject,isObservableArray,isObservableMap, set as mobSet} from 'mobx';
import {isBoxedObservable, isObservable, observable, isObservableProp, isObservableObject, isObservableArray, isObservableMap, isObservableSet, toJS} from 'mobx';

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
// export const NO_OP = Object.freeze(() => {});

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

export function isNativeFunction(obj) {
    return isFunction(obj) && obj.toString().endsWith('{ [native code] }');
}

export function isFunction(obj) {
    return typeof obj === 'function';
}

export function isString(obj) {
    return typeof obj === 'string' || obj instanceof String;
}

export function isNumber(obj) {
    return typeof obj === 'number' || obj instanceof Number;
}

export function isPromise(obj) {
    return obj instanceof Promise;
}

export function isBoolean(obj) {
    return obj === true || obj === false; // there's also a `Boolean` type but it doesn't behave much like a boolean
}

export function isRegExp(obj) {
    return obj instanceof RegExp;
}

export function isDate(obj) {
    return obj instanceof Date;
}

export function isSet(obj) {
    return obj instanceof Set || isObservableSet(obj);
}

export function isMap(x) {
    return isObservableMap(x) || x instanceof Map || x instanceof WeakMap;
}

export function isArray(x) {
    return isObservableArray(x) || Array.isArray(x);
}
export function isObject(obj) {
    return obj !== null && typeof obj === 'object';
}

export function isWeakMap(obj) {
    return obj instanceof WeakMap;
}

export function isNull(obj) {
    return obj === null;
}

export function isUndefined(obj) {
    return obj === undefined;
}

/**
 * Returns true if a value is null, undefined, or NaN.
 */
export function isNullish(obj) {
    return obj === null || obj === undefined || obj !== obj;
}

export function isPlainObject(obj) {
    return isObject(obj) && (obj.constructor === Object // obj = {}
        || obj.constructor === undefined // obj = Object.create(null)
    );
}

export function isSymbol(obj) {
    return typeof obj === 'symbol';
}

export function isError(obj) {
    return obj instanceof Error;
}

/* istanbul ignore next */
export function isIntLoose(obj) {
    return (typeof obj === 'string' && /^(0|[1-9][0-9]*)$/.test(obj))
        || (Number.isFinite(obj) && ~~obj === obj);
}

/* istanbul ignore next */
export function isInt(obj) {
    return (typeof obj === 'number') && (Number.isFinite(obj) && ~~obj === obj);
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
        } else if(isIntLoose(path1)) {
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
    setProperty(obj, path[end], typeof value === 'function' ? value(obj[path[end]]) : value);
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
    return map.delete(path[0]);
}

/* istanbul ignore next */
function setProperty(obj, key, value) {
    if(isObservableObject(obj)) {
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

export function toObservable(obj) {
    return isObject(obj) && !isObservable(obj) ? observable(obj) : (isString(obj) || isNumber(obj) ? observable.box(obj) : obj);
}

export function errorMapToFlatArray(errorMap){
    const arr = observable.array();
    errorMapToFlatArrayR(errorMap, arr);
    return toJS(arr);
}

/* istanbul ignore next */
function errorMapToFlatArrayR(errorMap, obsArray){
    if(isArray(errorMap)){
        obsArray.push(...errorMap);
        return errorMap;
    } else if (isMap(errorMap)){
        for (let eM of errorMap.values()){
            errorMapToFlatArrayR(eM, obsArray);
        }
    }
}

export function getObservable(obj, path) {
    if(!obj) return undefined;
    if(!Array.isArray(path)) {
        path = stringToPath(path);
    }
    let ret = obj;

    for(let key of path) {
        if(isMap(ret)) {
            ret = ret.get(key);
        } else {
            ret = ret[key];
        }
    }

    return ret;
}

export function getErrorsByPath(err, path) {
    for(let k of path) {
        if(isString(k)) {
            err = getValue(err,['properties',k]);
        } else if(isNumber(k)) {
            err = getValue(err,['items',k]);
        }
    }
    return err;
}
// export function mergeSchemaErrorMap(schema, stateTree, errorMap){
//     return mergeSchemaErrorMapR(schema, stateTree, errorMap, undefined);
// }
//
// function mergeSchemaErrorMapR(schema, stateTree, errorMap, propName){
//     const value = propName === undefined ? stateTree : getValue(stateTree, [propName]);
//     switch(schema.type){
//         case "object":
//             const newObj = {title: schema.title, errors: [], children: []};
//             for (let [key, err] in errorMap.entries()){
//                 if(key === "properties") {
//                     for(let p of Object.keys(schema.properties)){
//                         if(err.has(p)) {
//                             newObj.children.push(mergeSchemaErrorMapR(schema.properties[p], value, err.get(p), p));
//                         }
//                     }
//                 }else if(isArray(err)){
//                     newObj.errors.push(...err);
//                 }
//             }
//             return newObj;
//         case "array":
//             const newArrObj = {title: schema.title, errors: [], children: []};
//             for (let [key, err] in errorMap.entries()){
//                 if(key === "items") {
//                     for(let i = 0; i < value.length; ++i) {
//                         if(err.has(i)) {
//                             newArrObj.children.push(mergeSchemaErrorMapR(schema.items[i], value, err.get(i), i));
//                         }
//                     }
//                 }else if(isArray(err)){
//                     newArrObj.errors.push(...err);
//                 }
//             }
//             return newArrObj;
//         default:
//             console.warn("Schema merge on unexpected schema type:", schema.type);
//             break;
//     }
// }