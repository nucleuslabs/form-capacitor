/**
 * Unwraps a value. If passed a function, evaluates that function with the provided args. Otherwise, returns the value as-is.
 */
import {EMPTY_OBJECT} from './constants';
import {clone} from 'lodash';

export function resolveValue(functionOrValue, ...args) {
    return typeof functionOrValue === 'function' ? functionOrValue.call(this, ...args) : functionOrValue;
}

export const identity = x => x;
export const defaultDeserializeField = x => x === undefined ? '' : String(x);
export const defaultDeserializeForm = x => x === undefined ? EMPTY_OBJECT : x;
export const defaultSerialize = identity;

export function defaults(target=Object.create(null), ...sources) {
    for(let obj of sources) {
        if(typeof obj === 'function') {
            obj = obj(target);
        }
        for(let key of Object.keys(obj)) {
            if(obj[key] !== undefined) {
                target[key] = obj[key];
            }
        }
    }
    return target;
}

/**
 * Sets a value at the given path. Mutates every object along the way.
 */
export function setValue(obj, path, value) {
    const end = path.length - 1;
    for(let i=0; i<end; ++i) {
        const key = path[i];
        if(obj[key]) {
            obj[key] = clone(obj[key]);
        } else if(/^(0|[1-9][0-9]*)$/.test(path[i+1])) {
            obj[key] = new Array(parseInt(path[i+1])+1);
        } else {
            obj[key] = Object.create(null);
        }
        obj = obj[key];
    }
    obj[path[end]] = value;
}