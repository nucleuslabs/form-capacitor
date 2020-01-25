/**
 * This function takes in a mobxStateTree and Returns an object that is first passded through the mobx toJS function (https://mobx.js.org/refguide/tojson.html)
 * and then all empty arrays and empty objects are replaced with undefined so that AJV anyOF's, required and dependencies keywords
 * work in a more logical fashion.
 * @param mst
 */
import {toJS} from "mobx";

/**
 * This will recursively trim undefined branches and return a trimmed tree or an empty object
 *
 * @param {*} mst
 * @returns {Map<any, any> | Set<unknown> | * | {}}
 */
export default function mobxTreeToSimplifiedObjectTree(mst) {
    const js = toJS(mst);
    return replaceEmptyObjectPropertiesAndArraysWithUndefinedR(js) || {};
}

function replaceEmptyObjectPropertiesAndArraysWithUndefinedR(obj) {
    if(Array.isArray(obj)) {
        if(obj.length === 0) {
            return undefined;
        } else {
            const newArr = obj.map(replaceEmptyObjectPropertiesAndArraysWithUndefinedR).filter(value => value !== undefined);
            return newArr.length === 0 ? undefined : newArr;
        }
    } else if(obj instanceof Map || obj instanceof WeakMap) {
        if(obj.size === 0) {
            return undefined;
        } else {
            const map = new Map();
            obj.forEach((value, key) => {
                const newItem = replaceEmptyObjectPropertiesAndArraysWithUndefinedR(value);
                if(newItem !== undefined) {
                    map.set(key, replaceEmptyObjectPropertiesAndArraysWithUndefinedR(value));
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
    } else if(Object.prototype.toString.call(obj) === "[object Object]") {
        const keys = Object.keys(obj);
        if(!keys || keys.length === 0) {
            return undefined;
        } else {
            return keys.reduce(function(acc, prop) {
                //filter out undefined values
                const newProp = replaceEmptyObjectPropertiesAndArraysWithUndefinedR(obj[prop]);
                if(newProp !== undefined && !(Object.prototype.toString.call(newProp) === "[object Object]" && Object.keys(newProp).length === 0)) {
                    acc[prop] = newProp;
                }
                return acc;
            }, {});
        }
    } else {
        return obj;
    }
}