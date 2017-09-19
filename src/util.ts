/**
 * Unwraps a value. If passed a function, evaluates that function with the provided args. Otherwise, returns the value as-is.
 */
import {EMPTY_OBJECT} from './constants';

export function resolveValue<T>(this: any, functionOrValue: ((...args: any[]) => T)|T, ...args: any[]): T {
    return typeof functionOrValue === 'function' ? functionOrValue.call(this, ...args) : functionOrValue;
}

export const identity = x => x;
export const defaultDeserializeField = x => x === undefined ? '' : String(x);
export const defaultDeserializeForm = x => x === undefined ? EMPTY_OBJECT : x;
export const defaultSerialize = identity;

// export function defaults(target=Object.create(null), ...sources) {
//     for(let obj of sources) {
//         if(typeof obj === 'function') {
//             obj = obj(target);
//         }
//         for(let key of Object.keys(obj)) {
//             if(obj[key] !== undefined) {
//                 target[key] = obj[key];
//             }
//         }
//     }
//     return target;
// }