import { isArrayLike, isMapLike, isPlainObject, isSetLike, isString } from './helpers';

/** @type {number} options bitmask which collapses all objects with no defined parameters after processing all children */
export const EMPTY_OBJECTS = 1;
/** @type {number} options bitmask which collapses all empty arrays with no elements after processing all children */
export const EMPTY_ARRAYS = 2;
/** @type {number} options bitmask which collapses all empty maps */
export const EMPTY_MAPS = 3;
/** @type {number} options bitmask which collapses all empty sets */
export const EMPTY_SETS = 4;
/** @type {number} options bitmask which converts all empty strings to undefined*/
export const EMPTY_STRINGS = 8;
/** @type {number} options bitmask which converts all null values to undefined*/
export const NULLS = 16;
/** @type {number} options bitmask which converts the numbers 0 and -0 to undefined*/
export const ZERO = 32;
/** @type {number} options bitmask which converts false to undefined*/
export const FALSE = 64;
/** @type {number} options bitmask which converts all falsy values to undefined*/
export const FALSY = 128;
/** @type {number} convenience options bitmask for triggering to convert all falsy scalar values to undefined*/
export const EMPTY_SCALARS = EMPTY_STRINGS | NULLS | ZERO | FALSE | FALSY;
/** @type {number} convenience options bitmask for triggering to collapse all empty iterables*/
export const EMPTY_ITERABLES = EMPTY_ARRAYS | EMPTY_MAPS | EMPTY_SETS;
/** @type {number} convenience options bitmask for triggering to collapse all empty iterables, empty objects and convert nulls to undefined*/
export const DEFAULT_FILTERS = EMPTY_OBJECTS | EMPTY_ITERABLES | NULLS;
/** @type {number} convenience options bitmask for triggering to convert nulls adn empty strings to undefined*/
export const TEXT_FILTERS = NULLS | EMPTY_STRINGS;

/**
 * Built in sanitization function that converts any nulls in an object tree to undefined and collapses undefined properties and array elements
 * @param {{}} tree
 * @returns {{}}
 */
export function builtInDefaultSanitizer(tree){
    return sanitizeTree(tree, NULLS);
}

/**
 * Default sanitizer which collapses all Empty Objects, Arrays, Sets, Maps and null values into undefined
 * @param {{}} tree
 * @returns {{}}
 */
export function builtInStateTreeSanitizer(tree){
    return sanitizeTree(tree, DEFAULT_FILTERS);
}

/**
 *
 * @param {{}} tree
 * @param {int} options
 * @param {[number, string, null, boolean]} convertSpecificScalarValuesToUndefined
 * @returns {{}}
 */
export function sanitizeTree(tree, options = DEFAULT_FILTERS, convertSpecificScalarValuesToUndefined = []){
    if(!isPlainObject(tree)){
        throw new Error(`Form capacitors built-in sanitization algorithms only works on POJO's. '${typeof tree}' detected.`);
    }
    if(!isArrayLike(convertSpecificScalarValuesToUndefined) && convertSpecificScalarValuesToUndefined !== undefined){
        throw new Error(`convertSpecificScalarValuesToUndefined can only be undefined or an array of scalar values. '${typeof convertSpecificScalarValuesToUndefined}' detected.`);
    }
    return sanitizeObject(tree, (someObj) => sanitizeR(someObj, options, buildScalarConditionMap(options, convertSpecificScalarValuesToUndefined)), ((options & EMPTY_OBJECTS) === EMPTY_OBJECTS)) || {};
}

/**
 * built-in recursive sanitization function that filters out whatever is not wanted
 * @param {*} subject
 * @param {int} options Bitwise flags for filtering options
 * @param {Map} scalarConditionalMap use
 * @returns {*}
 */
export function sanitizeR(subject, options, scalarConditionalMap) {
    const customRecursiveSanitizer = (obj) => sanitizeR(obj, options, scalarConditionalMap);
    //@todo so many if decisions in here. There is probably a more efficient solution using typeOf or something like that.
    // If you have the skill make this more efficient but keep code easy to read; go for it.
    if(isArrayLike(subject)) {
        return sanitizeArray(subject, customRecursiveSanitizer, ((options & EMPTY_ARRAYS) === EMPTY_ARRAYS));
    } else if(isMapLike(subject)) {
        return sanitizeMap(subject, customRecursiveSanitizer, ((options & EMPTY_MAPS) === EMPTY_MAPS));
    } else if(isSetLike(subject)) {
        return sanitizeSet(subject, customRecursiveSanitizer, ((options & EMPTY_SETS) === EMPTY_SETS));
    } else if(isPlainObject(subject) && !isString(subject)) {
        return sanitizeObject(subject, customRecursiveSanitizer, ((options & EMPTY_OBJECTS) === EMPTY_OBJECTS));
    } else {
        return scalarConditionalMap.has(subject) ? undefined : subject;
    }
}

/**
 * Sanitizes arrays using a recursive sanitization callback
 * @param {*[]} arr
 * @param {function(*)} recursiveSanitizationCallback
 * @param {boolean} filterEmpty
 * @returns {undefined|*[]}
 */
export function sanitizeArray (arr, recursiveSanitizationCallback, filterEmpty) {
    if(arr.length === 0) {
        return filterEmpty ? undefined : [];
    } else if(filterEmpty) {
        const newArr = arr.map(recursiveSanitizationCallback).filter(value => value !== undefined);
        return newArr.length === 0 ? undefined : newArr;
    } else {
        return arr.map(recursiveSanitizationCallback).filter(value => value !== undefined);
    }
}

/**
 * sanitizes Maps using a recursive sanitization callback
 * @param {Map|WeakMap} map
 * @param {function(*)} recursiveSanitizationCallback
 * @param {boolean} filterEmpty
 * @returns {undefined|Map<any, any>}
 */
export function sanitizeMap (map, recursiveSanitizationCallback, filterEmpty){
    if(map.size === 0) {
        return filterEmpty ? undefined : new Map();
    } else {
        const newMap = new Map();
        map.forEach((value, key) => {
            const newItem = recursiveSanitizationCallback(value);
            if(newItem !== undefined) {
                newMap.set(key, newItem);
            }
        });
        return filterEmpty && newMap.size === 0 ? undefined : newMap;
    }
}

/**
 * sanitizes Sets using a recursive sanitization callback
 * @param {Set|WeakSet} set
 * @param {function(*)} recursiveSanitizationCallback
 * @param {boolean} filterEmpty
 * @returns {undefined|Set<any>}
 */
export function sanitizeSet (set, recursiveSanitizationCallback, filterEmpty){
    if(set.size === 0) {
        return filterEmpty ? undefined : new Set();
    } else {
        const newSet = new Set();
        set.forEach((value) => {
            const newItem = recursiveSanitizationCallback(value);
            if(newItem !== undefined) {
                newSet.add(newItem);
            }
        });
        return filterEmpty && newSet.size === 0 ? undefined : newSet;
    }
}

/**
 *
 * @param {{}} obj
 * @param {function(*)} recursiveSanitizationCallback
 * @param {boolean} filterEmpty
 * @returns {undefined|Set<any>}
 */
export function sanitizeObject (obj, recursiveSanitizationCallback, filterEmpty){
    const keys = Object.keys(obj);
    if(!keys || keys.length === 0) {
        return filterEmpty ? undefined : {};
    } else {
        const returnObj = keys.reduce(function (acc, prop) {
            //filter out undefined values
            const newProp = recursiveSanitizationCallback(obj[prop]);
            if(newProp !== undefined) {//&& !(isObject(newProp) && Object.keys(newProp).length === 0)
                acc[prop] = newProp;
            }
            return acc;
        }, {});
        return (filterEmpty && Object.keys(returnObj).length === 0) ? undefined : returnObj;
    }
}

/**
 * returns a map of conditions based on the params passed in
 * @param {int} options
 * @param {[string, number, boolean, null, NaN]} specificScalarValuesToConvertToUndefined an array of typed scalar values that will get converted to undefined
 * @returns {Map<any, any>}
 */
export function buildScalarConditionMap(options, specificScalarValuesToConvertToUndefined){
    const conditions = new Map();
    if(((options & FALSY) === FALSY)) {
        conditions.set(null, true);
        conditions.set('', true);
        conditions.set(0, true);
        conditions.set(-0, true);
        conditions.set(false, true);
        //conditions.set(0n, true); not really caring about this weirdness
        conditions.set(NaN, true);
    } else {
        if(((options & NULLS) === NULLS)) {
            conditions.set(null, true);
        }
        if(((options & EMPTY_STRINGS) === EMPTY_STRINGS)) {
            conditions.set('', true);
        }
        if(((options & ZERO) === ZERO)) {
            conditions.set(0, true);
            conditions.set(-0, true);
        }
        if(((options & FALSE) === FALSE)) {
            conditions.set(false, true);
        }
    }
    specificScalarValuesToConvertToUndefined.map((value) => conditions.set(value, true));
    return conditions;
}

/**
 * removes empty strings and nulls from the tree replacing them with undefined and collapsing undefined propterties and array elements
 * @param {{}} tree POJO tree
 * @returns {{}}
 */
export function emptyStringNullSanitizer(tree){
    return sanitizeTree(tree, TEXT_FILTERS);
}