import {isMapLike, isPlainObject} from "./helpers";

/**
 * This function takes in an object tree and returns a new object where all nulls, empty array like structures and empty objects are replaced with undefined
 * so that AJV anyOF's, required and dependencies keywords don't get tripped up on empty objects and arrays which evaluated as something and will cause
 * errors even though they do not have any data in them. Basically sanitizeObjectTree allows the object tree to stay strongly typed and json-schema to
 * handle required and dependency logic properly by converting empty things into undefined
 *
 * @param {{}} pojoTree
 * @returns {any}
 */
export default function sanitizeObjectTree(pojoTree) {
    return replaceEmptyObjectPropertiesAndArraysWithUndefinedR(pojoTree) || {};
}

/**
 * This function does very specific tree trimming on purpose for reasons listed in sanitizeObjectTree above:
 *  - Reduces all arrays,maps,sets that are either completely empty or only contain undefined elements into undefined
 *  - Reduces all maps that are either completely empty or only contain undefined elements into undefined
 *  - Reduces objects to undefined which have no elements to where all elements have been reduced to undefined
 *  - Keeps all other things
 *
 * @param {any} obj
 * @returns {{}|undefined|*}
 */
/* istanbul ignore next */
function replaceEmptyObjectPropertiesAndArraysWithUndefinedR(obj) {
    if(Array.isArray(obj)) {
        if(obj.length === 0) {
            return undefined;
        } else {
            const newArr = obj.map(replaceEmptyObjectPropertiesAndArraysWithUndefinedR);
            const justDefinedArr = newArr.filter(value => value !== undefined);
            return justDefinedArr.length === 0 ? undefined : newArr;
        }
    } else if(isMapLike(obj)) {
        if(obj.size === 0) {
            return undefined;
        } else {
            const map = new Map();
            obj.forEach((value, key) => {
                const newItem = replaceEmptyObjectPropertiesAndArraysWithUndefinedR(value);
                if(newItem !== undefined) {
                    map.set(key, newItem);
                }
            });
            return map.size === 0 ? undefined : map;
        }
    } else if(obj instanceof Set) {
        if(obj.size === 0) {
            return undefined;
        } else {
            const set = new Set();
            obj.forEach((value) => {
                const newItem = replaceEmptyObjectPropertiesAndArraysWithUndefinedR(value);
                if(newItem !== undefined) {
                    set.add(newItem);
                }
            });
            return set.size === 0 ? undefined : set;
        }
    } else if(isPlainObject(obj)) {
        const keys = Object.keys(obj);
        if(!keys || keys.length === 0) {
            return undefined;
        } else {
            const returnObj = keys.reduce(function (acc, prop) {
                //filter out undefined values
                const newProp = replaceEmptyObjectPropertiesAndArraysWithUndefinedR(obj[prop]);
                if(newProp !== undefined && !(isPlainObject(newProp) && Object.keys(newProp).length === 0)) {
                    acc[prop] = newProp;
                }
                return acc;
            }, {});
            return Object.keys(returnObj).length > 0 ? returnObj : undefined;
        }
    } else {
        return obj;
    }
}