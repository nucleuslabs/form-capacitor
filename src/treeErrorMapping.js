import {isObservableMap, observable, ObservableMap} from "mobx";

export function getErrorNode(errorNode, path = []){
    if(!errorNode) return undefined;
    let node = errorNode;
    for(let key of path) {
        if(node.has('children')){
            const childNode = node.get('children');
            if(childNode.has(key)){
                node = childNode.get(key);
            }
        } else {
            return undefined;
        }
    }
    return node;
}

/**
 *
 * @param {Map} errorNode
 * @param path
 * @returns {*|Array|Array}
 */
export function getErrors(errorNode, path = []) {
    const node = getErrorNode(errorNode, path);
    if(!isObservableMap(node)) return [];
    return node.has('errors') ? node.get('errors') || [] : [];
}

/**
 *
 * @param {ObservableMap} errorNode
 * @param {string[]} path
 * @param {{}} error
 * @param {{}} schema
 * @returns {*}
 */
export function setError(errorNode, path = [], error, schema){
    const node = setErrorNode(errorNode, path);
    if(node.has('errors')) {
        node.get('errors').push(error);
        if(schema){
            node.set('schema', schema);
        }
    } else {
        node.set('errors', observable.array([error]));
        if(schema){
            node.set('schema', schema);
        }
    }
}

/**
 *
 * @param {ObservableMap} errorNode
 * @param {string[]} path
 * @param {[{}]} errors
 * @returns {*}
 */
export function setErrors(errorNode, path = [], errors){
    const node = setErrorNode(errorNode, path);
    if(node.has('errors')) {
        node.get('errors').push(...errors);
    } else {
        node.set('errors', observable.array(errors));
    }
}

/**
 *
 * @param {ObservableMap} errorNode
 * @param {string[]} path
 * @returns {boolean}
 */
export function delErrorNode(errorNode, path){
    if(!isObservableMap(errorNode)) {
        throw new Error(`delMap only works on observable maps`);
    }
    if(!path.length) {
        throw new Error("Cannot delete root");
    }
    return delErrorNodeR(errorNode, path);
}

/* istanbul ignore next */
function delErrorNodeR(map, path) {
    if(!map.has('children')) return false;
    const childMap = map.get('children');
    if(path.length > 1) {
        const [first, ...rest] = path;
        const next = childMap.get(first);
        if(!next) return false;
        const deleted = delErrorNodeR(next, rest);
        if(!next.has('children') || !next.get('children').size){
            childMap.delete(first);
            cleanNode(map);
        }
        return deleted;
    }
    if(path.length > 0) {
        if(childMap.size === 0){
           map.delete();
        } else {
            return childMap.delete(path[0]) && cleanNode(map);
        }
    }
    return false;
}

/* istanbul ignore next */
function cleanNode(node){
    let result = true;
    if(node.has("errors") && node.get("errors").size === 0){
        result = node.delete("errors") && result;
    }
    if(node.has("children") && node.get("children").size === 0){
        result = node.delete("children") && result;
    }
    if(node.has("schema") && node.get("schema").size === 0){
        result = node.delete("schema") && result;
    }
    return result;
}

/**
 *
 * @param {ObservableMap} errorNode
 * @param {string[]} path
 * @returns {IObservableArray<any>}
 */
export function getFlattenedErrors(errorNode, path = []){
    const node = getErrorNode(errorNode, path);
    const arr = observable.array();
    errorMapToFlatArrayR(node, arr);
    return arr;
}

/**
 *
 * @param {ObservableMap} errorMap
 * @param {IObservableArray<any>} obsArray
 */
/* istanbul ignore next */
function errorMapToFlatArrayR(errorMap, obsArray){
    if(errorMap.has('errors')){
        obsArray.push(...errorMap.get('errors'));
    }
    if(errorMap.has('children')){
        const childMap = errorMap.get('children');
        for (let eM of childMap.values()){
            errorMapToFlatArrayR(eM, obsArray);
        }
    }
}

/**
 *
 * @param {ObservableMap} errorNode
 * @param {string[]} path
 * @returns {*}
 */
/* istanbul ignore next */
function setErrorNode(errorNode, path){
    let node = errorNode;
    for(let key of path) {
        if(!node.has('children')){
            node.set('children', observable.map());
        }
        const childrenNode = node.get('children');
        if(!childrenNode.has(key)) {
            childrenNode.set(key, observable.map());
        }
        node = childrenNode.get(key);
    }
    return node;
}