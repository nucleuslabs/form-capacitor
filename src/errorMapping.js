import {isObservableMap, observable, ObservableMap, ObservableSet, IObservableArray} from "mobx";
import {pathToPatchString, ajvStringToPath} from "./validation";

/**
 *
 * @param {ObservableMap} errorNode
 * @param {string[]} [path=[]]
 * @returns {undefined|*}
 */
export function getErrorNode(errorNode, path = []) {
    if(!errorNode) return undefined;
    let node = errorNode;
    for(let key of path) {
        if(node.has('children')) {
            const childNode = node.get('children');
            if(childNode.has(key)) {
                node = childNode.get(key);
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }
    }
    return node;
}

/**
 *
 * @param {ObservableMap} errorNode
 * @param {string[]} [path=[]]
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
 * @param {string[]} [path=[]]
 * @param {{}} error
 * @returns {boolean}
 */
export function hasError(errorNode, path = [], error) {
    const node = getErrorNode(errorNode, path);
    if(!isObservableMap(node)) return false;
    return node.has('_errorMap') ? node.get('_errorMap').has(error.message) : false;
}

/**
 *
 * @param {ObservableMap} errorNode
 * @param {string[]} [path=[]]
 * @param {{}} error
 * @param {[]} originPath
 */
export function setError(errorNode, path = [], error, originPath) {
    const node = setErrorNode(errorNode, path);
    const oPath = originPath || path;
    _setError(node, path, error);
    setPathIndexRelationships(errorNode, oPath, path, error);
}

/**
 *
 * @param {ObservableMap} errorNode
 * @param {string[]} [path=[]]
 * @param {[{}]} errors
 * @param {[]} originPath
 */
export function setErrors(errorNode, path = [], errors, originPath) {
    const node = setErrorNode(errorNode, path);
    const oPath = originPath || path;
    errors.forEach((error) => {
        _setError(node, path, error);
        setPathIndexRelationships(errorNode, oPath, path, error);
    });
}

/**
 *
 * @param {ObservableMap} node
 * @param {string[]} [path=[]]
 * @param {{}} error
 */
/* istanbul ignore next */
function _setError(node, path = [], error) {
    if(node.has('errors')) {
        const errorMap = node.get('_errorMap');
        if(!errorMap.has(error.message)) {
            errorMap.set(error.message, error);
            node.get('errors').push(error);
        }
    } else {
        node.set('errors', observable.array([error]));
        node.set('_errorMap', observable.map([[error.message, error]]));
    }
}

/* istanbul ignore next */
function setPathIndexRelationships(errorNode, originPath, newPath, error) {
    if(errorNode.has('pathIndex')) {
        const pathIndex = errorNode.get('pathIndex');
        const oPathString = pathToPatchString(originPath);
        const nPathString = pathToPatchString(newPath);
        let pathMap = observable.map();
        if(pathIndex.has(oPathString)) {
            pathMap = pathIndex.get(oPathString);
            if(!pathMap.has(nPathString)) {
                pathMap.set(nPathString, observable.set([]));
            }
            const messageSet = pathMap.get(nPathString);
            messageSet.add(error.message);
        } else {
            pathIndex.set(oPathString, pathMap);
            pathMap.set(nPathString, observable.set([]));
            pathMap.get(nPathString).add(error.message);
        }
    }
}

/**
 *
 * @param {ObservableMap} errorMap
 * @param {string[]} path
 * @returns {boolean}
 */

export function deleteAllNodes(errorMap, path) {
    if(errorMap.has('pathIndex')) {
        const pathIndex = errorMap.get('pathIndex');
        const pathString = pathToPatchString(path);
        if(pathIndex.has(pathString)) {
            const pathMap = pathIndex.get(pathString);
            pathMap.forEach((errors, destPathString) => {
                deleteNodeErrors(errorMap, destPathString, errors);
            });
            pathIndex.delete(pathString);
        }
    }
}

/**
 *
 * @param {ObservableMap} errorMap
 * @param {string[]} path
 */
export function deleteOwnNode(errorMap, path) {
    if(errorMap.has('pathIndex')) {
        const pathIndex = errorMap.get('pathIndex');
        const pathString = pathToPatchString(path);
        if(pathIndex.has(pathString)) {
            const pathMap = pathIndex.get(pathString);
            if(pathMap.has(pathString)) {
                deleteNodeErrors(errorMap, pathString, pathMap.get(pathString));
                pathMap.delete(pathString);
            }
            if(pathMap.size === 0) {
                pathIndex.delete(pathString);
            }
        }
    }
}
//
// /**
//  * Deletes all errors for the provided path that were triggerred on the current path as well as all errors triggered by the current path
//  * that do not appear in the provide map of errors
//  * @param {Map|ObservableMap} errorMap
//  * @param {string[]} path
//  * @param {Map|ObservableMap} mapOfErrorsByPathStr A Map keyed by error path in ajv format ("/path/to/item") where each element is an iterable of error objects with a message param
//  */
// export function deleteOwnAndRelatedThatAreNotInMap(errorMap, path, mapOfErrorsByPathStr) {
//     if(errorMap.has('pathIndex')) {
//         const pathIndex = errorMap.get('pathIndex');
//         const pathString = pathToPatchString(path);
//         if(pathIndex.has(pathString)) {
//             const pathMap = pathIndex.get(pathString);
//             if(pathMap.has(pathString)) {
//                 deleteNodeErrors(errorMap, pathString, pathMap.get(pathString));
//                 pathMap.delete(pathString);
//             }
//             _deleteErrorsThatAreNotInMap(errorMap, pathMap, mapOfErrorsByPathStr);
//             if(pathMap.size === 0) {
//                 pathIndex.delete(pathString);
//             }
//         }
//     }
// }

/**
 * Deletes all errors for the provided path that were triggered on the current path as well as all errors triggered by the current path
 * that do not appear in the provide map of errors
 * @param {Map|ObservableMap} errorMap
 * @param {string[]} path
 * @param {Map|ObservableMap} mapOfErrorsByPathStr A Map keyed by error path in ajv format ("/path/to/item") where each element is a Map of error objects keyed by message
 */
export function deleteAllThatAreNotInMap(errorMap, path, mapOfErrorsByPathStr) {
    if(errorMap.has('pathIndex')) {
        const pathIndex = errorMap.get('pathIndex');
        const pathString = pathToPatchString(path);
        if(pathIndex.has(pathString)) {
            const pathMap = pathIndex.get(pathString);
            _deleteErrorsThatAreNotInMap(errorMap, pathMap, mapOfErrorsByPathStr);
            if(pathMap.size === 0) {
                pathIndex.delete(pathString);
            }
        }
    }
}

/* istanbul ignore next */
function _deleteErrorsThatAreNotInMap(errorMap, pathMap, mapOfErrorsByPathStr) {
    pathMap.forEach((errorMessageSet, destPathString) => {
        if(mapOfErrorsByPathStr.has(destPathString)) {
            const existingErrors = mapOfErrorsByPathStr.get(destPathString);
            const errorsToDelete = Array.from(errorMessageSet).filter(errorMessage => !existingErrors.has(errorMessage));
            if(errorsToDelete.length > 0) {
                deleteNodeErrors(errorMap, destPathString, errorsToDelete);
            }
        } else {
            deleteNodeErrors(errorMap, destPathString, errorMessageSet);
        }
    });
}

/**
 *
 * @param {ObservableMap} errorNode
 * @param {string} destPathString
 * @param {string[]|Map|ObservableMap|Set|ObservableSet} errors
 */
/* istanbul ignore next */
function deleteNodeErrors(errorNode, destPathString, errors) {
    const destPath = ajvStringToPath(destPathString);
    const node = getErrorNode(errorNode, destPath);
    if(node && node.has('errors')) {
        const nodeErrors = node.get('_errorMap');
        errors.forEach(message => {
            nodeErrors.delete(message);
        });
        deepCleanNode(errorNode, destPath);
    }
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
        if(!next.has('children') || !next.get('children').size) {
            childMap.delete(first);
            cleanNode(map);
        }
        return deleted;
    }
    if(path.length > 0) {
        if(childMap.size === 0) {
            map.clear();
        } else {
            return childMap.delete(path[0]) && cleanNode(map);
        }
    }
    return false;
}

/**
 * returns true if the node is empty
 * @param {ObservableMap} errorNode
 * @param {string[]} [path=[]]
 * @returns {boolean}
 */
/* istanbul ignore next */
function cleanNode(errorNode, path = []) {
    const node = getErrorNode(errorNode, path);
    let empty = true;
    if(!node) {
        return empty;
    }
    if(node.has("errors")) {
        const errorArray = node.get("errors");
        const errorMap = node.get("_errorMap");
        empty = false;
        if(errorArray.length === 0 || errorMap.size === 0) {
            empty = node.delete("errors") && node.delete("_errorMap");
        } else if(errorArray.length !== errorMap.size) {
            errorArray.length = 0;
            errorArray.push(...Array.from(errorMap.values()));
        }
    }
    if(node.has("children")) {
        if(node.get("children").size === 0) {
            empty = node.delete("children") && empty;
        } else {
            empty = false;
        }
    }
    if(empty && node.has("pathIndex")) {
        node.delete("pathIndex");
    }
    return empty;
}

/**
 * returns true if the nodes are empty
 * @param {ObservableMap} errorNode
 * @param {string[]} [path=[]]
 */
/* istanbul ignore next */
function deepCleanNode(errorNode, path = []) {
    const mutablePath = [...path];
    for(let i = path.length - 1; i >= 0; i--) {
        if(cleanNode(errorNode, mutablePath)) {
            delErrorNodeR(errorNode, mutablePath);
        } else {
            break;
        }
        mutablePath.pop();
    }
}

/**
 *
 * @param {ObservableMap} errorNode
 * @param {string[]} [path=[]]
 * @returns {IObservableArray<any>}
 */
export function getFlattenedErrors(errorNode, path = []) {
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
function errorMapToFlatArrayR(errorMap, obsArray) {
    if(errorMap.has('errors')) {
        obsArray.push(...errorMap.get('errors'));
    }
    if(errorMap.has('children')) {
        const childMap = errorMap.get('children');
        for(let eM of childMap.values()) {
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
function setErrorNode(errorNode, path) {
    if(!errorNode.has('pathIndex')) {
        errorNode.set('pathIndex', new Map());
    }
    let node = errorNode;
    for(let key of path) {
        if(!node.has('children')) {
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