import {observable, ObservableMap, toJS} from 'mobx';
import {getValue, delMap, setMap} from './helpers';
import Ajv from "ajv";
import stringToPath from "./stringToPath";
import {onPatch} from "mobx-state-tree";
import UndefinedPropertyError from "./UndefinedPropertyError";

//This object contains actions for mapping special error cases based on schema type and error keyword combo
/* istanbul ignore next */
const errTypeKeywordActions = {
    /**
     * Processes required to see if there are children that need to be targeted
     * @param errMap
     * @param path
     * @param error
     */
    "object-required": (errMap, path, error) => {
        setErrMap(errMap, [...path, 'properties', error.params.missingProperty], error);
    },
    /**
     * Processes if keyword to see if there are children that need to be targeted
     * @param errMap
     * @param path
     * @param error
     */
    "object-if": (errMap, path, error) => {
        setErrMap(errMap, [...path, 'properties', error.params.missingProperty], error);
    },
    /**
     * Processes dependecies keyword to see if there are children that need to be targeted
     * @param errMap
     * @param path
     * @param error
     * @param dupeMap
     */
    "object-dependencies": (errMap, path, error, dupeMap) => {
        //check keyword, missingProperty and  path so we don't have duplicate errors
        const checkKey = `.object-dependencies-${error.params.missingProperty}. ${path.join(".")}`;
        if(!dupeMap.has(checkKey)) {
            setErrMap(errMap, [...path, 'properties', error.params.missingProperty], error);
            dupeMap.set(checkKey, error);
        }
    },
    /*
    "dependencies": (errMap, path, error, dupeMap) => {
        //check keyword, missingProperty and  path so we don't have duplicate errors
        const checkKey = `.dependencies-${error.params.missingProperty}. ${path.join(".")}`;
        if(!dupeMap.has(checkKey)) {
            setErrMap(errMap, [...path, 'properties', error.params.missingProperty], error);
            dupeMap.set(checkKey, error);
        }
    },*/
    "required": (errMap, path, error) => {
        setErrMap(errMap, [...path, 'properties', error.params.missingProperty], error);
    },
    "oneOf": () => {
    },
    "anyOf": () => {
    },
    "allOf": () => {
    }
};
/* istanbul ignore next */
/**
 * This function runs thr ought he error map and transforms the errors into a tree.
 * This is so the errors can be applied to the appropriate observables and be used to highlight fields and stuff
 * @param {array} errors
 * @param {ObservableMap} pathMap
 * @returns {ObservableMap}
 */

/* istanbul ignore next */
function ajvErrorsToErrorMap(errors, pathMap) {
    const errMap = observable.map();
    const dupeMap = new Map();
    // console.log("pathMap", toJS(pathMap));
    errors.map(error => {
        // console.log("Error.path",error.dataPath);
        //Skip any errors missing a parent schema
        if(error.parentSchema !== false) {
            const dataStr = `data:#${error.dataPath}`;
            const schemaStr = `schema:${error.schemaPath}`;
            const path = toJS(getClosestAjvPath(error.dataPath ? dataStr : schemaStr, pathMap)) || ['#'];
            //Check error message to process complex errors to see if we need to add more to the path or more errors
            const actionKey = `${error.parentSchema.type}-${error.keyword}`;
            // console.log(path, error.dataPath ? dataStr : schemaStr);
            // console.log(error);

            if(error.parentSchema.type && errTypeKeywordActions[actionKey]) {
                errTypeKeywordActions[actionKey](errMap, path, error, dupeMap);
            } else if(errTypeKeywordActions[error.keyword]) {
                errTypeKeywordActions[error.keyword](errMap, path, error, dupeMap);
            } else {
                setErrMap(errMap, path, error);
            }
        }
    });
    return errMap;
}

/* istanbul ignore next */
function setErrMap(errMap, path, error) {
    const errorArray = getValue(errMap, path, undefined);
    if(errorArray !== undefined) {
        errorArray.push(error);
    } else {
        setMap(errMap, path, observable.array([error]));
    }
}

/* istanbul ignore next */
/**
 * Get the closest path from a map of paths for a string conatined in an ajv Error objects schemaPath
 * @param {string} pathStr
 * @param {Map|ObservableMap} pathMap
 * @returns {*}
 */

/* istanbul ignore next */
function getClosestAjvPath(pathStr, pathMap) {
    let pos;
    let checkStr = pathStr.trimLeft();
    if(pathMap.has(checkStr)) {
        return pathMap.get(checkStr);
    }
    while((pos = checkStr.lastIndexOf("/")) !== -1) {
        // console.log("Check Path:" + checkStr.substring(0, pos));
        checkStr = checkStr.substring(0, pos);
        if(pathMap.has(checkStr)) {
            return pathMap.get(checkStr);
        }
    }
    return pathMap.get("#");
}

/**
 *
 * @param {{}} schema
 * @param {[]} path
 */

/* istanbul ignore next */
function getSchemaNodeFromPath(schema, path) {
    if(!Array.isArray(path)) {
        path = stringToPath(path);
    }
    let ret = schema;

    for(let key of path) {
        switch(ret.type) {
            case 'object':
                if(ret.properties) {
                    if(ret.properties[key] !== undefined){
                        ret = ret.properties[key];
                    } else {
                        throw new UndefinedPropertyError(key, ret);
                    }
                }
                break;
            case 'array':
                if(ret.items) {
                    ret = ret.items[key];
                }
                break;
        }
    }
    return ret;
}

/* istanbul ignore next */
/**
 * Converts an array of ajv errors into an array of condensed pretty error objs
 * @param {{}[]} errors
 * @param {string[]} path
 * @returns {{title: {string}, message: {string}, path: {string, ""?}, keyword: {string}}[]}
 */

/* istanbul ignore next */
function beautifyAjvErrors(errors, path) {
    // console.warn(errors);
    return errors.map(error => {
        return beautifyAjvError(error, path);
    });
}

/**
 * Converts an ajv error into a condensed pretty error obj
 * @param {{}} error
 * @param {string[]} path
 * @returns {{title: {string}, message: {string}, path: {string[]}, keyword: {string}}}
 */

/* istanbul ignore next */
function beautifyAjvError(error, path) {
    return createError(error.parentSchema.title, error.parentSchema.errorMessage || error.message, path, error.keyword);
}

/**
 * Creates a basic error obj
 * @param {string} title
 * @param {string} message
 * @param {Array} path
 * @param {string} keyword
 * @returns {{title: {string}, message: {string}, path: {Array}, keyword: {string}}}
 */

/* istanbul ignore next */
function createError(title, message, path, keyword) {
    return {title, message, path, keyword};
}

export function createAjvObject() {
    return new Ajv(Object.assign({
        allErrors: true,
        $data: true,
        ownProperties: true,
        jsonPointers: true,
        async: false,
        verbose: true,
    }));
}

export function checkSchemaPathForErrors(ajv, schema, path, value) {
    const subValidator = ajv.compile(getSchemaNodeFromPath(schema, path));
    if(subValidator(value)) {
        return [];
    } else {
        return beautifyAjvErrors(subValidator.errors, path);
    }
}


/**
 * Recursive function that generates a map of json-schemas. It takes in a global json-schema and creates sub json-schema files for each "scalar" field and adds any external
 * references to the sub schema including any required, anyOf, allOf keywords that reference the field
 * @param {{}|undefined} schema
 * @param {String|undefined} propName
 * @param {[]} path
 * @param {Map|undefined} fieldSchemaMap This is a map that will be mutated and will be set in tree form setting a schema for each scalar field (leaf of the tree)
 */

/* istanbul ignore next */
function buildFieldSchemaMapR(schema, propName, path = [], patchPath = [], fieldSchemaMap = new Map(), patchPathToSchemaPathMap = new Map(), relatedRefMap = new Map(), subSchemaMap = new Map()) {
    if(propName !== undefined) {
        path.push(propName);
    }

    switch(schema.type) {
        case 'object':
            if(schema.properties) {
                for(let p of Object.keys(schema.properties)) {
                    buildFieldSchemaMapR(schema.properties[p], p, [...path, 'properties'], [...patchPath, p], fieldSchemaMap, patchPathToSchemaPathMap, relatedRefMap);
                    patchPathToSchemaPathMap.set("/" + [...patchPath, p].join("/"), [...path, 'properties', p]);
                    assignFieldSchema(buildSchemaTree([...path, 'properties', p], {...schema.properties[p]}), fieldSchemaMap, [...path, 'properties', p]);
                    subSchemaMap.set("/" + [...path, 'properties', p].join("/"), {...schema.properties[p]});
                }
            }
            break;
        case 'array':
            buildFieldSchemaMapR(schema.items, "items", path, [...patchPath, '0'], fieldSchemaMap, patchPathToSchemaPathMap, relatedRefMap);
            patchPathToSchemaPathMap.set("/" + [...patchPath, "0"].join("/"), path);
            assignFieldSchema(buildSchemaTree([...path], {...schema}), fieldSchemaMap, [...path]);
            subSchemaMap.set("/" + [...path].join("/"), {...schema});
            break;
    }

    if(schema.required && schema.required.length > 0) {
        // Going to assign each root object/field level required to itself unlike anyOf or allOf
        // because each field can decide whether it is required on its own unless they are in a
        // codependent anyOf or allOf validation
        schema.required.map(p => {
            assignFieldSchema(buildSchemaTree(path, {required: [p]}), fieldSchemaMap, patchPathToSchemaPathMap.get(pathToPatchString([...patchPath, p])));
        });
        // assignFieldSchemas(new Set(schema.required.map(p => {
        //      return patchPathToSchemaPathMap.get(pathToPatchString([...patchPath, p]));
        //  })), buildSchemaTree(path, {required: [p]}), fieldSchemaMap);
    }

    if(schema.dependencies) {
        mapObject(schema.dependencies, (dependency, p) => {
            if(Array.isArray(dependency)){
                assignFieldSchema(buildSchemaTree(path, {dependencies: dependency}), fieldSchemaMap, patchPathToSchemaPathMap.get(pathToPatchString([...patchPath, p])));
            } else if(dependency && dependency.properties){
                assignFieldSchema(buildSchemaTree(path, {dependencies: dependency}), fieldSchemaMap, patchPathToSchemaPathMap.get(pathToPatchString([...patchPath, p])));
            }
        });
        // throw new Error("form-capacitor does not support dependency validation yet");
    }

    let refCollection = [];

    if(schema.anyOf && schema.anyOf.length > 0) {
        const anyOfRefCollection = new Set(schema.anyOf.reduce((acc, anyOfSchema) => {
            return [...acc, ...getFieldReferencesR(anyOfSchema, propName,[...path], patchPath, patchPathToSchemaPathMap)];
        },[]));
        if(anyOfRefCollection && anyOfRefCollection.size > 0) {
            assignFieldSchemas(anyOfRefCollection, buildSchemaTree([...path], {anyOf: [...schema.anyOf]}), fieldSchemaMap);
            refCollection = [...anyOfRefCollection];
        }
     }
    
    if(schema.allOf && schema.allOf.length > 0) {
        const allOfRefCollection = new Set(schema.allOf.reduce((acc, allOfSchema) => {
            return [...acc, ...getFieldReferencesR(allOfSchema, propName,[...path], patchPath, patchPathToSchemaPathMap)];
        },[]));
        if(allOfRefCollection && allOfRefCollection.size > 0) {
            assignFieldSchemas(allOfRefCollection, buildSchemaTree([...path], {allOf: [...schema.allOf]}), fieldSchemaMap);
            refCollection = [...refCollection, ...allOfRefCollection];
        }
     }

    relatedRefMap.set([...relatedRefMap], refCollection);

    return [fieldSchemaMap, patchPathToSchemaPathMap, subSchemaMap, relatedRefMap];//ADD A REFMAP HERE THAT WILL hold refs to fields so that you can fire related validators based on that if they exist!
}

/**
 *
 * @param {*} obj
 * @param {Function} mapFunction
 */
function mapObject(obj, mapFunction) {
    const keys = Object.keys(obj);
    if(keys.length > 0) {
        keys.map(key => {
            mapFunction(obj[key], key);
        });
    }
}

/**
 *
 * @param {[]} path
 * @param {{}} leafValue
 */

/* istanbul ignore next */
function buildSchemaTree(path, leafValue = {}) {
    if (path.length > 0) {
        let schema = {};
        const end = path.length - 1;
        for(let i = 0; i < end; i++) {
            schema[path[i]] = {};
            schema = schema[path[i]];
        }
        schema[path[end]] = leafValue;
        return schema;
    } else {
        return leafValue;
    }
}

/**
 *
 * @param {Set} refs
 * @param {Map} fieldSchemaMap
 * @param {{}} mergeSchema
 * @param {[]} path
 */

/* istanbul ignore next */
function assignFieldSchemas(refs, schema, fieldSchemaMap) {
    // const refPatchPaths = [...refs].map(pathArr => pathToPatchString(pathArr));
    for (let fieldPath of refs) {
        assignFieldSchema(schema, fieldSchemaMap ,fieldPath, refs);
    }
}

/* istanbul ignore next */
function assignFieldSchema(schema, fieldSchemaMap, path = [], refs = []) {
    // @todo: Filter out recursive refs...
    const fieldPathId = pathToPatchString(path);
    if (fieldSchemaMap.has(fieldPathId)) {
        const fsMapInst = fieldSchemaMap.get(fieldPathId);
        fieldSchemaMap.set(fieldPathId, {schema: mergeObjects(fsMapInst.schema, schema), refs: new Set([...fsMapInst.refs, ...refs]), path: path});
    } else {
        fieldSchemaMap.set(fieldPathId, {schema: mergeObjects(schema), refs: new Set([...refs]), path: path});
    }
}

/* istanbul ignore next */
function mergeObjects(...schemas) {
    return Object.assign({}, ...schemas);
}

/* istanbul ignore next */
function pathToPatchString(path, sep = "/") {
    return sep + path.join(sep);
}

/**
 *
 * @param {{}} schema
 * @param {String} propName
 * @param {[]} path
 * @returns {Set<any>}
 */

/* istanbul ignore next */
function getFieldReferencesR(schema, propName, path = [], patchPath, patchPathToSchemaPathMap = new Map()) {
    let refs = new Set();
    for(let schemaProp of Object.keys(schema)) {
        switch (schemaProp) {
            case 'required':
            case 'dependencies':
                if (schema[schemaProp].length > 0) {
                    refs = new Set([...refs, ...schema[schemaProp].map(p => {
                        return patchPathToSchemaPathMap.get(pathToPatchString([...patchPath, p]));
                    })]);
                }
                break;
            case 'anyOf':
            case 'allOf':
                const subRefSets = schema[schemaProp].map(anyOf => getFieldReferencesR(anyOf, propName, path, patchPath, patchPathToSchemaPathMap)).filter(ref => ref.length > 0);
                for (let i = 0; i < subRefSets.length; ++i) {
                    refs = new Set([...refs, ...subRefSets[i]]);
                }
                break;
            case 'type':
                switch(schemaProp) {
                    case 'object':
                        for(let p of Object.keys(schema.properties)) {
                            const objSubSet = getFieldReferencesR(schema.properties[p], propName, [...path, 'properties', p], [...patchPath, p], patchPathToSchemaPathMap);
                            refs = new Set([...refs, ...objSubSet]);
                        }
                        break;
                    case 'array':
                        const arrSubSet = getFieldReferencesR(schema.items, propName, [...path, 'items'], patchPath, patchPathToSchemaPathMap);
                        refs = new Set([...refs, ...arrSubSet]);
                        break;
                    case 'string':
                    case 'number':
                    case 'integer':
                    case 'boolean':
                        refs.add([...path, propName]);
                        break;
                }
                break;
            case 'if':
                console.warn("The 'if' keyword is not currently fully supported so you may get some differences between imperative and declarative validation");
        }
    }

    return refs;
}

/**
 * watches a MobXStateTree Object for errors using a dereferenced json_schema
 * @param {{}} schema Root json schema must have a definitions property and all references must be parsed fully
 * @param {{}} data {MobXStateTree} object
 * @param {{}} ajv {Ajv} object
 * @returns {{errors: ObservableMap<any, any>, validate: validate}}
 */
export function watchForErrorsPatch(schema, data, ajv) {
    const errors = observable.map();
    const paths = observable.map();
    const validators = new Map();
    //build field validators
    const [fieldSchemaMap, patchPathToSchemaPathMap, subSchemaMap] = buildFieldSchemaMapR(schema);


    for (let [path ,{schema:fieldSchema, refs}] of fieldSchemaMap) {
        // console.debug(path);
        // console.debug(fieldSchema);
        validators.set(path, {
            validate: ajv.compile(fieldSchema),
            subSchema: subSchemaMap.get(path),
            refs: refs
        });
    }
    //build root avj schema
    // const dispose = watchForErrorsR(schema, data, undefined, errors, [], ajv, paths, fieldSchemaMap);
    onPatch(data, patch => {
        const genericPath = rebuildPatchPath(patch.path);
        if(patchPathToSchemaPathMap.has(genericPath)) {
            const schemaPath = [...patchPathToSchemaPathMap.get(genericPath)];
            const schemaPathStr = pathToPatchString(schemaPath);
            if(validators.has(schemaPathStr)) {
                // console.debug(subSchema);
                // console.log(`Observable Patch Detected for ${genericPath}`, patch.path, patch.op, patch.value);
                switch(patch.op) {
                    case 'add':
                    case 'replace':
                    case 'remove':
                        // console.log(toJS(data));
                        // console.log("OP detected", schemaPathStr, toJS((data)));
                        runValidator(schemaPath, validators, data, errors, [schemaPath]);
                        // if(validate(toJS((data)))) {
                        //     delMap(errors, [...errorPath]);
                        // } else {
                        //     //check errors to see if path grouping needs to happen to assign errors to correct fields
                        //     // const errorPathStr = errorPath.join("/");
                        //     const filteredErrors = validate.errors.filter(err => filterJsonSchemaErrors(err, errorPath.join("/")));
                        //     if(filteredErrors.length > 0){
                        //         setMap(errors, [...errorPath], observable.array((subSchema.errorMessage) ? [createError(subSchema.title, subSchema.errorMessage, errorPath, "custom")] : beautifyAjvErrors(Array.from(filteredErrors), errorPath)));
                        //     } else {
                        //         delMap(errors, [...errorPath]);
                        //     }
                        // }
                        //
                        // //Now that base validation is complete... we need to check refs
                        // if(refs.size > 0) {
                        //     validateRefs(refs, validators, data, errors, [schemaPath]);
                        // }

                        break;
                    default:
                        console.warn(`Couldn't handle patch operation ${patch.op} for ${patch.path}.`);
                }
            } else {
                console.warn(`COULD NOT FIND VALIDATOR FOR`, schemaPath, patch.path, patch.op, patch.value);

            }
        } else {
            console.warn(`COULD NOT FIND PATH FOR`, patch.path, patch.op, patch.value);
        }
    });

    const validate = ajv.compile(schema);
    return {
        errors, validate: (data) => {
            if(!validate(data)) {
                const ajvErrMap = ajvErrorsToErrorMap(validate.errors, paths, undefined, undefined);
                processAjvErrorMapUsingSchemaR(schema, undefined, data, ajvErrMap, errors, undefined);
                return false;
            } else {
                errors.clear();
                return true;
            }
        }
    };
}


function validateRefs(refs, validators, data, errors, skipPaths = []){
    for(let refPath of refs){
        // @todo: Filter out recursive refs... Once they are filtered this may not be necessary...
        if(!skipPaths.includes(refPath)){
            runValidator(refPath, validators, data, errors, [...refs]);
        }
    }
}

function runValidator(path, validators, data, errors, skipPaths){
    const pathStr = pathToPatchString(path);
    if(validators.has(pathStr)){
        const errorPath = [...path];
        errorPath.shift();
        const {validate, subSchema, refs} = validators.get(pathStr);
        if(validate(toJS(data))) {
            delMap(errors, [...errorPath]);
        } else {
            const filteredErrors = validate.errors.filter(err => filterJsonSchemaErrors(err, errorPath.join("/")));
            if(filteredErrors.length > 0){
                setMap(errors, [...errorPath], observable.array((subSchema.errorMessage) ? [createError(subSchema.title, subSchema.errorMessage, errorPath, "custom")] : beautifyAjvErrors(Array.from(filteredErrors), errorPath)));
            } else {
                delMap(errors, [...errorPath]);
            }
        }
        validateRefs(refs, validators, data, errors, [...skipPaths]);
    }
}
/**
 * This is a filtering function which will return true if an error is valid and relates to the current path or false if it is not
 * @param {{}} err
 * @param {string} errorPath
 * @returns {boolean}
 */
function filterJsonSchemaErrors(err, errorPath){
    //@todo: flesh this out more as required
    switch(err.keyword) {
        case "required":
            return err.params.missingProperty === errorPath;
        default:
            return true;
    }
}

/**
 * todo: could probably put a check in to only process patches with numbers in them make this faster
 * @param {string} pathStr
 * @param {string} sep
 * @returns {string}
 */
function rebuildPatchPath(pathStr, sep = "/"){
    const re = /^\d+$/;
    const path = pathStr.split(sep).map(node => node.match(re) ? "0" : node);
    // path.shift();
    return path.join(sep);
}

/* istanbul ignore next */
/**
 * Uses json schema and a MobXStateTree to update an errorMap with the errors found in an ajv validation
 *
 * @param {{}} schema json schema object
 * @param {string[]|undefined} errorPath
 * @param {{}} dataObj Mobxstate tree or tree element
 * @param {Map} ajvErrorMap
 * @param {ObservableMap} errors
 * @param {string|number|undefined} propName
 */

/* istanbul ignore next */
function processAjvErrorMapUsingSchemaR(schema, errorPath, dataObj, ajvErrorMap, errors, propName) {
    const value = propName === undefined ? dataObj : getValue(dataObj, [propName]);
    if(errorPath === undefined) {
        errorPath = [];
    }
    const ajvErrors = getValue(ajvErrorMap, ['#', ...errorPath], undefined);
    if(ajvErrors || propName === undefined) {
        switch(schema.type) {
            case 'object':
                if(schema.properties) {
                    for(let p of Object.keys(schema.properties)) {
                        processAjvErrorMapUsingSchemaR(schema.properties[p], [...errorPath, 'properties', p], value, ajvErrorMap, errors, p);
                    }
                }
                break;
            case 'array':
                for(let i = 0; i < value.length; ++i) {
                    processAjvErrorMapUsingSchemaR(schema.items, [...errorPath, 'items', i], value, ajvErrorMap, errors, i);
                }
                break;
            default:
                 // console.log(errorPath.join('.'), "Added", toJS(ajvErrors), Array.from(ajvErrors));
                if(schema.errorMessage !== undefined) {
                    setMap(errors, errorPath, [createError(schema.title, schema.errorMessage, [...errorPath], 'custom')]);
                } else {
                    setMap(errors, errorPath, beautifyAjvErrors(Array.from(ajvErrors).map(errorObj => {
                        if(errorObj.keyword === 'required' && schema.title) {
                            return Object.assign(errorObj, {message: errorObj.message.replace(errorObj.params.missingProperty, schema.title)});
                        } else {
                            return errorObj;
                        }
                    }), errorPath));
                }
                break;
        }
    } else {
        // console.log(errorPath.join('.'), "Deleted");
        // console.log(errors);
        delMap(errors, errorPath);
    }
}

// /**
//  * watches a MobXStateTree Object for errors using a dereferenced json_schema
//  * @param {{}} schema Root json schema must have a definitions property and all references must be parsed fully
//  * @param {{}} data {MobXStateTree} object
//  * @param {Ajv} ajv {Ajv} object
//  * @returns {{dispose: *, errors: ObservableMap<any, any> validate: {validateCallback} }}
//  */
// export function watchForErrors(schema, data, ajv) {
//     const errors = observable.map();
//     const paths = observable.map();
//     //build field validators
//     const [fieldSchemaMap] = buildFieldSchemaMapR(schema);
//     //build root avj schema
//     const dispose = watchForErrorsR(schema, data, undefined, errors, [], ajv, paths, fieldSchemaMap);
//     const validate = ajv.compile(schema);
//     return {
//         errors, dispose, validate: (data) => {
//             if(!validate(data)) {
//                 const ajvErrMap = ajvErrorsToErrorMap(validate.errors, paths, undefined, undefined);
//                 processAjvErrorMapUsingSchemaR(schema, undefined, data, ajvErrMap, errors, undefined);
//                 return false;
//             } else {
//                 errors.clear();
//                 return true;
//             }
//         }
//     };
// }
// /**
//  *
//  * @param schema
//  * @param obj
//  * @param propName
//  * @param errors
//  * @param {string[]} errorPath
//  * @param ajv
//  * @param paths
//  * @param fieldSchemaMap
//  * @param {string[]} dataPath
//  * @returns {function(): *}
//  */
//
// /* istanbul ignore next */
// function watchForErrorsR(schema, obj, propName, errors, errorPath, ajv, paths, fieldSchemaMap, dataPath) {
//     const disposers = [];
//     const value = propName === undefined ? obj : getValue(obj, [propName]);
//     if(dataPath === undefined) {
//         dataPath = [];
//     }
//     if(propName === undefined) {
//         paths.set('#', ['#']);
//     } else {
//         paths.set('schema:#/' + errorPath.join("/"), ['#', ...errorPath]);
//         paths.set('data:#/' + dataPath.join("/"), ['#', ...errorPath]);
//     }
//     switch(schema.type) {
//         case 'object':
//             if(schema.properties) {
//                 for(let p of Object.keys(schema.properties)) {
//                     // console.log(`Watching ${propName} prop`, p);
//                     const dispose = watchForErrorsR(schema.properties[p], value, p, errors, [...errorPath, 'properties', p], ajv, paths, fieldSchemaMap, [...dataPath, p]);
//                     disposers.push(dispose);
//                 }
//             }
//             break;
//         case 'array':
//             const rowDisposers = [];
//             // let arrValidator = parentValidator;
//             // //Check to see if schema needs to create a specific parentValidator to build errors for any array items
//             // if(schema.maxItems || schema.minItems|| schema.uniqueItems || schema.contains) {
//             //     arrValidator = buildValidator(ajv, schema, obj, propName, errorPath, dataPath);
//             //     if(parentValidator === undefined) {
//             //         pathBuilderR(schema, value, [...errorPath], [...dataPath], paths);
//             //     }
//             // }
//
//             for(let i = 0; i < value.length; ++i) {
//                 rowDisposers[i] = watchForErrorsR(schema.items, value, i, errors, [...errorPath, 'items', i], ajv, paths, fieldSchemaMap, [...dataPath, i]);
//             }
//
//             disposers.push(doObserve(value, change => {
//                 if(change.addedCount) {
//                     const end = change.index + change.addedCount;
//                     for(let i = change.index; i < end; ++i) {
//                         rowDisposers[i] = watchForErrorsR(schema.items, value, i, errors, [...errorPath, 'items', i], ajv, paths, fieldSchemaMap, [...dataPath, i]);
//                     }
//                 } else if(change.removedCount) {
//                     const itemErrors = getMap(errors, [...errorPath, 'items']);
//                     if(itemErrors) {
//                         const lastKey = Math.max(...itemErrors.keys());
//                         const end = change.index + change.removedCount;
//                         // console.log(change.index,end,lastKey);
//                         for(let i = change.index; i <= lastKey; ++i) {
//                             rowDisposers[i]();
//                             const err = itemErrors.get(i);
//                             if(err) {
//                                 itemErrors.delete(i);
//                                 if(i >= end) {
//                                     const newIdx = i - change.removedCount;
//                                     err.set(newIdx, err);
//                                     rowDisposers[newIdx] = watchForErrorsR(schema.items, value, newIdx, errors, [...errorPath, 'items', newIdx], ajv, paths, fieldSchemaMap, [...dataPath, newIdx]);
//                                 }
//                             }
//                         }
//                         // spliceMap(itemErrors,change.index,change.removedCount);
//                     }
//                     // const del = rowDisposers.splice(change.index, change.removedCount);
//                     // console.log('del',del);
//                     // execAll(del);
//                     // console.log(itemErrors.length);
//
//                 }
//             }));
//
//             disposers.push(() => execAll(rowDisposers));
//             break;
//         case 'string':
//         case 'number':
//         case 'integer':
//         case 'boolean':
//             if(propName === undefined) {
//                 throw new Error(`Cannot watch primitive ${schema.type}`);
//             }
//
//             //We don't want to watch primitives for arrays
//             if(isInt(propName)) {
//                 // console.log(propName, value);
//                 break;
//             }
//
//             //Create a validator for this field
//             const schemaPathId = errorPath.join('.');
//             const validate = ajv.compile(fieldSchemaMap.has(schemaPathId) ? Object.assign({}, schema, fieldSchemaMap.get(schemaPathId).schema) : schema);
//
//             disposers.push(doObserve(obj, propName, change => {
//                 // let value = input;
//                 // if(input && input.get !== undefined){
//                 //     value = input.get();
//                 // }
//                 let errs = [];
//                 let valid = validate(toJS(change));
//                 if(change === undefined) {
//                     if(schema.required) {
//                         errs = [createError(schema.title, `is a required field`, errorPath, "required")];
//                         valid = false;
//                     } else {
//                         valid = true;
//                     }
//                 } else if(!valid) {
//                     if(schema.errorMessage) {
//                         errs = [createError(schema.title, schema.errorMessage, errorPath, "custom")];
//                     } else {
//                         errs = beautifyAjvErrors(Array.from(validate.errors), errorPath);
//                     }
//                 }
//                 if(valid) {
//                     delMap(errors, [...errorPath]);
//                 } else {
//                     setMap(errors, [...errorPath], observable.array(errs));
//                 }
//             }));
//             break;
//         default:
//         // paths.delete("#/" + errorPath.join("/"));
//         //     throw new Error(`'${schema.type}' not supported`);
//     }
//     return () => execAll(disposers);
// }
// /* istanbul ignore next */
// function execAll(arrayOfFuncs) {
//     return arrayOfFuncs.forEach(exec);
// }
// /* istanbul ignore next */
// function doObserve(mobxStateTree, propName, change) {
//
//     if(change === undefined) {
//         change = propName;
//         propName = undefined;
//     }
//     // change(propName !== undefined ? mobxStateTree[propName] : mobxStateTree);
//     const dispose = observe(mobxStateTree, propName, c => {
//         // console.log(c.type);
//         switch(c.type) {
//             case 'splice':
//                 change({
//                     ...c,
//                     added: c.added.map(unbox),
//                     removed: c.removed.map(unbox),
//                 });
//                 break;
//             case 'update':
//                 change(c.newValue.value);
//                 break;
//             default:
//                 throw new Error(`unhandled change type ${c.type}`);
//         }
//     });
//
//     return () => {
//         dispose();
//     }
// }
//
// /* istanbul ignore next */
// function unbox(mstNode) {
//     return mstNode.value;
// }
//
// /* istanbul ignore next */
// function exec(f) {
//     f();
// }