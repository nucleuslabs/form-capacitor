import {isObservableMap, observable, ObservableMap} from "mobx";
import {pathToPatchString} from "./validation";

export function getErrorNode(errorNode, path = []){
    if(!errorNode) return undefined;
    return errorNode.has(pathToPatchString(path)) ? errorNode.get(pathToPatchString(path)) : undefined;
}

function getErrorNodeStrPath(errorNode, path){
    if(!errorNode) return undefined;
    return errorNode.has(path) ? errorNode.get(path) : undefined;
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
 * @param {{}} error
 * @param {string[]} path
 * @returns {*}
 */
export function setError(errorNode, path = [], error){
    const node = setErrorNode(errorNode, error.path || pathToPatchString(path));
    if(node.has('errors')) {
        node.get('errors').add(error.keyword || "custom", error);
    } else {
        node.set('errors', observable.map([[error.keyword || "custom", error]]));
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
    errors.map(error => setError(errorNode, path, error));
}

/**
 *
 * @param {ObservableMap} errorNode
 * @param {string[]} path
 * @returns {boolean}
 */
export function delErrorNode(errorNode, path = []){
    if(!isObservableMap(errorNode)) {
        throw new Error(`delMap only works on observable maps`);
    }
    const pathStr = pathToPatchString(path);
    const node = getErrorNode(errorNode, pathStr);
    if(!node){
        return true;
    } else {
        let deleted = true;
        if(node.has('edges')) {
            const edges = node.get('edges');
            if(edges.size > 0) {
                edges.forEach((subPath, errors) => {
                    const otherNode = getErrorNodeStrPath(errorNode, subPath);
                    if(otherNode.has('errors')) {
                        const nodeErrors = otherNode.get('errors');
                        if(nodeErrors.size > 0) {
                            errors.map(errorHash => {
                                deleted = deleted && nodeErrors.delete(errorHash);
                            });
                        }
                    }
                });
            }
            edges.clear();
        }
        return deleted;
    }
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
    if(errorNode.has(path)){

    }
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