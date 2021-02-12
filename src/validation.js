// eslint-disable-next-line no-unused-vars
import {observable, ObservableMap, toJS} from 'mobx';
import {isBoolean, isArrayLike, isMapLike, isSetLike} from './helpers';
import Ajv from "ajv";
import {onPatch} from "mobx-state-tree";
import SchemaValidationError from "./errorTypes/SchemaValidationError";
import {deleteAllNodes, deleteAllThatAreNotInMap, setError} from "./errorMapping";
import {
    setAnyOfErrorMessages,
    setArrayLengthErrorMessage,
    setNumberRangeErrorMessage,
    setTypeErrorMessage,
    setObjectErrorMessages,
    setStringErrorMessages
} from "./errorMessageBuilder";
import {replaceErrorMessage} from "./errorMessageFinder";

//This object contains actions for mapping special error cases based on schema type and error keyword combo

/* istanbul ignore next */
function dependencyActionCallBack(errCallback, validationPath, errorMapPath, error, subSchemaPathMap, dupeMap) {
    //check keyword, missingProperty and  validationPath so we don't have duplicate errors
    const checkKey = `.object-dependencies-${errorMapPath.join("-")}-${error.params.missingProperty}`;
    if(!dupeMap.has(checkKey)) {
        dupeMap.set(checkKey, error);
        const fullValidationPath = [...validationPath];
        return errCallback(fullValidationPath, [...errorMapPath, error.params.missingProperty], [...errorMapPath], error, subSchemaPathMap.get(pathToPatchString(fullValidationPath)));
        // setError(errMap, [...validationPath, error.params.missingProperty], error);
    } else {
        return undefined;
    }

}

/* istanbul ignore next */
function defaultActionCallBack(errCallback, validationPath, errorMapPath, error, subSchemaPathMap) {
    const fullValidationPath = [...validationPath, error.params.missingProperty];
    return errCallback(fullValidationPath, [...errorMapPath, error.params.missingProperty], [...errorMapPath, error.params.missingProperty], error, subSchemaPathMap.get(pathToPatchString(fullValidationPath)));
}

/* istanbul ignore next */
const errTypeKeywordActions = {
    /**
     * Processes required to see if there are children that need to be targeted
     * @param errCallback
     * @param path
     * @param error
     */
    "required": defaultActionCallBack,
    /**
     * Processes if keyword to see if there are children that need to be targeted
     * @param errCallback
     * @param path
     * @param error
     */
    "if": defaultActionCallBack,
    /**
     * Processes dependencies keyword to see if there are children that need to be targeted
     * @param validationPath
     * @param errCallback
     * @param errorMapPath
     * @param error
     * @param {Map} subSchemaPathMap
     * @param dupeMap
     */
    "dependencies": dependencyActionCallBack,
    "oneOf": () => {
    },
    "anyOf": () => {
    },
    "allOf": () => {
    }
};

/**
 * @todo #SmartErrorsChallenge make this function better... it is very weak in how it slices and dices ajv errors...it can be better... if you are reading this maybe you can make it better ;)
 * This function runs through the error map and transforms the errors into a tree.
 * This is so the errors can be applied to the appropriate observables and be used to highlight inputs
 * @param {array} errors
 * @param {ObservableMap} pathMap
 * @returns {ObservableMap}
 */

/* istanbul ignore next */
function processAjvErrors(errors, pathMap, errorPathMaps, errCallback, computedErrorPath = []) {
    const dupeMap = new Map();
    const schemaErrorPathMap = errorPathMaps.get("schema");
    const dataErrorPathMap = errorPathMaps.get("data");
    const subSchemaPathMap = errorPathMaps.get("subSchema");
    // console.log("pathMap", toJS(pathMap));
    return errors.filter(error => {
        // console.log("Error.path",error.dataPath);
        //Skip any errors missing a parent schema
        if(error.parentSchema !== false) {
            const [validationPath, errorPath] = getValidationAndErrorPaths(error, pathMap, dataErrorPathMap, schemaErrorPathMap);
            if(computedErrorPath.length > 0 && !sameParentBranch(computedErrorPath, errorPath)) {
                return false;
            }
            //shift off first element
            // validationPath.shift();
            //Check error message to process complex errors to see if we need to add more to the validationPath or more errors
            // console.log(validationPath, error.dataPath ? dataStr : schemaStr);
            // console.log(error);
            if(errTypeKeywordActions[error.keyword]) {
                return errTypeKeywordActions[error.keyword](errCallback, validationPath, errorPath, error, subSchemaPathMap, dupeMap);
            } else {
                return errCallback(validationPath, errorPath, errorPath, error, subSchemaPathMap.get(validationPath));
            }
        } else {
            return false;
        }
    });
}

/**
 * @todo #SmartErrorsChallenge make this function better... it is very weak in how it slices and dices ajv errors...it can be better... if you are reading this maybe you can make it better ;)
 * This function runs through the error map and transforms the errors into a tree.
 * This is so the errors can be applied to the appropriate observables and be used to highlight inputs
 * @param {array} errors
 * @param {ObservableMap} pathMap
 * @returns {ObservableMap}
 */

/* istanbul ignore next */
function reduceAjvErrorsToPathMappedErrors(errors, pathMap, errorPathMaps, errCallback, computedErrorPath = []) {
    const dupeMap = new Map();
    const schemaErrorPathMap = errorPathMaps.get("schema");
    const dataErrorPathMap = errorPathMaps.get("data");
    const subSchemaPathMap = errorPathMaps.get("subSchema");
    // console.log("pathMap", toJS(pathMap));
    return errors.reduce((acc, preError) => {
        const error = replaceErrorMessage(preError, errors);
        // console.log("Error.path",error.dataPath);
        //Skip any errors missing a parent schema
        if(error.parentSchema !== false) {
            const [validationPath, errorPath] = getValidationAndErrorPaths(error, pathMap, dataErrorPathMap, schemaErrorPathMap);
            if(computedErrorPath.length > 0 && !sameParentBranch(computedErrorPath, errorPath)) {
                return acc;
            }
            //shift off first element
            // validationPath.shift();
            //Check error message to process complex errors to see if we need to add more to the validationPath or more errors
            // const actionKey = `${error.parentSchema.type}-${error.keyword}`;
            // console.log(validationPath, error.dataPath ? dataStr : schemaStr);
            // console.log(error);
            let errorPair;
            if(errTypeKeywordActions[error.keyword]) {
                errorPair = errTypeKeywordActions[error.keyword](errCallback, validationPath, errorPath, error, subSchemaPathMap, dupeMap);
            } else {
                errorPair = errCallback(validationPath, errorPath, errorPath, error, subSchemaPathMap.get(validationPath));
            }
            if(errorPair) {
                accMapper(acc, errorPair);
            }
        }
        return acc;
    }, new Map());
}

function accMapper(acc, errorPair) {
    const [errorPath, error] = errorPair;
    if(acc.has(errorPath)) {
        acc.get(errorPath).set(error.message, error);
    } else {
        acc.set(errorPath, new Map([[error.message, error]]));
    }
}

/* istanbul ignore next */
function getValidationAndErrorPaths(error, pathMap, dataErrorPathMap, schemaErrorPathMap) {
    const dataStr = `data:#${error.dataPath}`;
    const schemaStr = `schema:${error.schemaPath}`;
    let validationPath = [];
    let errorPath = [];
    if(error.dataPath !== undefined) {
        if(error.dataPath) {
            if(dataErrorPathMap.has(error.dataPath)) {
                validationPath = dataErrorPathMap.get(error.dataPath);
                errorPath = ajvStringToPath(error.dataPath);
            } else {
                validationPath = toJS(getClosestAjvPath(dataStr, pathMap)).slice(1) || [];
                errorPath = [...validationPath];
            }
        }
    } else {
        const testPath = error.schemaPath.substr(1, error.schemaPath.length - 1);
        validationPath = schemaErrorPathMap.has(testPath) ? schemaErrorPathMap.get(testPath) : toJS(getClosestAjvPath(schemaStr, pathMap)).slice(1) || [];
        if(schemaErrorPathMap.has(testPath)) {
            validationPath = schemaErrorPathMap.get(testPath);
            errorPath = ajvStringToPath(error.schemaPath);
        } else {
            validationPath = toJS(getClosestAjvPath(schemaStr, pathMap)).slice(1);
            errorPath = [...validationPath];
        }
    }
    return [validationPath, errorPath];
}

/**
 * Get the closest path from a map of paths for a string contained in an ajv Error objects schemaPath
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

// @todo Evaluate if we will be using these functions in future versions
// /**
//  *
//  * @param {{}} schema
//  * @param {[]} path
//  */
//
// /* istanbul ignore next */
// function getSchemaNodeFromPath(schema, path) {
//     if(!isArrayLike(path)) {
//         path = stringToPath(path);
//     }
//     let ret = schema;
//
//     for(let key of path) {
//         switch(ret.type) {
//             case 'object':
//                 if(ret.properties) {
//                     if(ret.properties[key] !== undefined) {
//                         ret = ret.properties[key];
//                     } else {
//                         throw new UndefinedPropertyError(key, ret);
//                     }
//                 }
//                 break;
//             case 'array':
//                 if(ret.items) {
//                     ret = ret.items[key];
//                 }
//                 break;
//         }
//     }
//     return ret;
// }
//
// /**
//  * Converts an array of ajv errors into an array of condensed pretty error objs
//  * @param {{}[]} errors
//  * @param {string[]} path
//  * @returns {{title: {string}, message: {string}, path: {string, ""?}, keyword: {string}}[]}
//  */
//
// /* istanbul ignore next */
// function beautifyAjvErrors(errors, path) {
//     // console.warn(errors);
//     return errors.map(error => {
//         return transformAjvErrorToValidationError(error, path);
//     });
// }

/**
 * Converts an ajv error into a condensed pretty error obj
 * @param {{}} error
 * @param {string[]} path
 * @returns {{title: {string}, message: {string}, path: {string[]}, keyword: {string}}}
 */

/* istanbul ignore next */
function transformAjvErrorToValidationError(error, path, subSchema) {
    const schema = subSchema || error.parentSchema;
    return createValidationError(schema.title, error.message, path, error.keyword);
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
function createValidationError(title, message, path, keyword) {
    return {title, message, path, keyword};
}

export function createAjvObject() {
    return new Ajv({
        allErrors: true,
        $data: true,
        ownProperties: true,
        jsonPointers: true,
        async: false,
        verbose: true,
    });
}

// @todo Decide whether to remove this function
// export function checkSchemaPathForErrors(ajv, schema, path, value) {
//     const subValidator = ajv.compile(getSchemaNodeFromPath(schema, path));
//     if(subValidator(value)) {
//         return [];
//     } else {
//         return beautifyAjvErrors(subValidator.errors, path);
//     }
// }

/* istanbul ignore next */
function setPatchPathSchema(patchPathToSchemaPathMap, schemaPath, rootPatchPath, leafName) {
    patchPathToSchemaPathMap.set(pathToPatchString([...rootPatchPath, leafName]), [...schemaPath]);
}

/* istanbul ignore next */
function assignMetaData(metaData, path, metaDataMap) {
    const fieldPathId = pathToPatchString(path);
    if(metaDataMap.has(fieldPathId)) {
        const mapInst = metaDataMap.get(fieldPathId);
        Object.assign(mapInst, metaData);
    } else {
        metaDataMap.set(fieldPathId, {...metaData});
    }
}

/**
 * @todo #DependencyChallenge . There is an opportunity for performance enhancement by either getting rid of the dependency Refs (Part 1) or by limiting the scope of the dependency validation (Part 2)
 *
 * @param {{}} schema
 * @param {Array} path
 * @param {Array} patchPath
 * @param {Map} fieldDefinitionMap
 * @param {Map}patchPathToSchemaPathMap
 * @param {Map} relatedRefMap
 * @param {Map} metaDataMap
 * @param {Map} errorPathMaps
 * @param {Map} skeletonSchemaMap
 */

/* istanbul ignore next */
function buildFieldObjectSchema(schema, path, patchPath, fieldDefinitionMap, patchPathToSchemaPathMap, metaDataMap, errorPathMaps, skeletonSchemaMap) {
    const baseProperties = {};
    if(schema.properties) {
        for(let p of Object.keys(schema.properties)) {
            const property = schema.properties[p];
            const errorSchemaPathMap = errorPathMaps.get('schema');
            const errorDataPathMap = errorPathMaps.get('data');
            const subSchemaPathMap = errorPathMaps.get('subSchema');
            const patchPathStr = pathToPatchString([...patchPath, p]);
            const schemaPathStr = pathToPatchString([...path, "properties", p]);
            errorSchemaPathMap.set(schemaPathStr, [...patchPath, p]);
            errorDataPathMap.set(patchPathStr, [...patchPath, p]);
            subSchemaPathMap.set(patchPathStr, property);
            buildFieldDefinitionMapR({
                schema: property,
                propName: p,
                path: [...path, 'properties'],
                patchPath: [...patchPath, p],
                fieldDefinitionMap: fieldDefinitionMap,
                patchPathToSchemaPathMap: patchPathToSchemaPathMap,
                metaDataMap: metaDataMap,
                errorPathMaps: errorPathMaps,
                skeletonSchemaMap: skeletonSchemaMap,
                parentSchema: schema
            });
            setPatchPathSchema(patchPathToSchemaPathMap, [...path, 'properties', p], [...patchPath], p);
            /* @todo #DependencyChallenge Part 1 we technically shouldn't need these dependency refs with the way Part 1 is handled currently,
                 however in an AllOrNothing logic situation containing inter-dependencies validations can clear or exist in situations where they shouldn't
            */
            assignFieldDefinition(buildSchemaTree([...path, 'properties', p], {...property}, skeletonSchemaMap), fieldDefinitionMap, [...path, 'properties', p], []);//schema.dependencies !== undefined ? getDependencyRefs(schema.dependencies, p, path, patchPath, patchPathToSchemaPathMap) : []
            baseProperties[p] = {type: property.type, anyOf: property.anyOf, allOf: property.allOf};
        }
    }
    /** Notes on dependencies and required:
     * required:     The items in the required keyword array will get individually tied directly to the validators for the fields they represent which will increase performance.
     *
     * dependencies: The items in the dependencies keyword will get tied to the root object and a reference will lead from the dependent fields to the root validator
     *               this is not optimal but it is accurate in future the @todo will be to separate the dependency to it's own special node */
    //setObjectErrorMessages mutates skeletonSchemaMap so that it will attach the proper errorMessages to the sub-schema for the validators
    setObjectErrorMessages(skeletonSchemaMap);
    if(schema.required && schema.required.length > 0) {
        // Going to assign each root object/field level required to itself unlike anyOf or allOf
        // because each field can decide whether it is required on its own unless they are in a
        // codependent anyOf or allOf validation
        schema.required.forEach(p => {
            assignFieldDefinition(buildSchemaTree(path, {required: [p]}, skeletonSchemaMap), fieldDefinitionMap, patchPathToSchemaPathMap.get(pathToPatchString([...patchPath, p])));
            assignMetaData({required: true}, [...patchPath, p], metaDataMap);
        });
    }
    if(schema.dependencies) {
        const depSchema = {type: schema.type, properties: baseProperties, dependencies: {...schema.dependencies}};
        assignFieldDefinition(buildSchemaTree(path, depSchema, skeletonSchemaMap), fieldDefinitionMap, patchPathToSchemaPathMap.get(pathToPatchString([...patchPath])));
        /**
         * dependencies are quite tricky...
         * In order to solve our initial dependency challenge I have created a ref onto each field which has a dependency to a skeleton of that fields root object
         * The only thing in the faux root objects root json_schema is the dependency
         */
        mapObject(schema.dependencies, (dependency, p) => {
            // const depSchema = {properties: baseProperties, dependencies: {[p] : dependency}}
            /**
             * dependencies are quite tricky part 2...
             * In order to solve our supplementary dependency challenge I will attach a ref onto each field which has is mentioned in the dependencies keyword to a skeleton of that fields root object
             * @todo optimize the dependency loops if necessary
             */
            if(isArrayLike(dependency)) {
                patchPathToSchemaPathMap.set(pathToPatchString([...patchPath, p]), [...path, 'properties', p]);
                assignFieldDefinition({}, fieldDefinitionMap, patchPathToSchemaPathMap.get(pathToPatchString([...patchPath, p])), [[...path]]);
                // console.log(JSON.stringify(fieldDefinitionMap.get(pathToPatchString(patchPathToSchemaPathMap.get(pathToPatchString([...patchPath, p]))))));
                dependency.forEach(depField => {
                    patchPathToSchemaPathMap.set(pathToPatchString([...patchPath, depField]), [...path, 'properties', depField]);
                    assignFieldDefinition({}, fieldDefinitionMap, patchPathToSchemaPathMap.get(pathToPatchString([...patchPath, depField])), [[...path]]);
                });
            } else if(dependency && dependency.properties) {
                patchPathToSchemaPathMap.set(pathToPatchString([...patchPath, p]), [...path, 'properties', p]);
                assignFieldDefinition({}, fieldDefinitionMap, patchPathToSchemaPathMap.get(pathToPatchString([...patchPath, p])), [[...path]]);
                for(let depField of Object.keys(dependency.properties)) {
                    patchPathToSchemaPathMap.set(pathToPatchString([...patchPath, depField]), [...path, 'properties', depField]);
                    assignFieldDefinition({}, fieldDefinitionMap, patchPathToSchemaPathMap.get(pathToPatchString([...patchPath, depField])), [[...path]]);
                }
            }
        });
    }
}

/**
 *
 * @param {{}} schema
 * @param {Array} path
 * @param {Array} patchPath
 * @param {Map} fieldDefinitionMap
 * @param {Map} patchPathToSchemaPathMap
 * @param {Map} relatedRefMap
 * @param {Map} metaDataMap
 * @param {Map} errorPathMaps
 * @param {Map} skeletonSchemaMap
 */

/* istanbul ignore next */
function buildFieldArraySchema(schema, path, patchPath, fieldDefinitionMap, patchPathToSchemaPathMap, metaDataMap, errorPathMaps, skeletonSchemaMap) {
    assignFieldDefinition(buildSchemaTree([...path], {...schema}, skeletonSchemaMap), fieldDefinitionMap, [...path], []);
    if(isArrayLike(schema.items)) {
        schema.items.forEach((item, itemIdx) => {
            skeletonSchemaMap.set(pathToPatchString([...path, 'items', itemIdx]), {type: item.type});
            const errorSchemaPathMap = errorPathMaps.get('schema');
            const errorDataPathMap = errorPathMaps.get('data');
            const subSchemaPathMap = errorPathMaps.get('subSchema');
            const subPatchPath = [...patchPath, itemIdx];
            const patchPathStr = pathToPatchString(subPatchPath);
            errorSchemaPathMap.set(pathToPatchString([...path, "items", itemIdx]), subPatchPath);
            errorDataPathMap.set(patchPathStr, subPatchPath);
            subSchemaPathMap.set(patchPathStr, item);
            setPatchPathSchema(patchPathToSchemaPathMap, [...path, 'items'], [...patchPath], itemIdx);
            assignFieldDefinition(buildSchemaTree([...path, "items", itemIdx], {...item}, skeletonSchemaMap), fieldDefinitionMap, [...path, "items", itemIdx], [[...path]]);
            buildFieldDefinitionMapR({
                schema: item,
                propName: itemIdx,
                path: [...path, 'items'],
                patchPath: [...subPatchPath],
                fieldDefinitionMap: fieldDefinitionMap,
                patchPathToSchemaPathMap: patchPathToSchemaPathMap,
                metaDataMap: metaDataMap,
                errorPathMaps: errorPathMaps,
                skeletonSchemaMap: skeletonSchemaMap,
                parentSchema: schema
            });
        });
        if(schema.additionalItems) {
            skeletonSchemaMap.set(pathToPatchString([...path, 'additionalItems']), {type: schema.additionalItems.type});
            const additionalItemsPath = [...patchPath, "additionalItems"];
            const errorSchemaPathMap = errorPathMaps.get('schema');
            const errorDataPathMap = errorPathMaps.get('data');
            const subSchemaPathMap = errorPathMaps.get('subSchema');
            errorSchemaPathMap.set(pathToPatchString([...path, "additionalItems"]), additionalItemsPath);
            errorDataPathMap.set(pathToPatchString(additionalItemsPath), additionalItemsPath);
            subSchemaPathMap.set(pathToPatchString([...additionalItemsPath]), schema.additionalItems);
            if(!isBoolean(schema.additionalItems)) {
                setPatchPathSchema(patchPathToSchemaPathMap, [...path], [...patchPath], 'additionalItems');
                assignFieldDefinition(fieldDefinitionMap.get(pathToPatchString(path)).schema, fieldDefinitionMap, [...path, 'additionalItems'], [[...path]]);
                buildFieldDefinitionMapR({
                    schema: schema.items,
                    propName: "additionalItems",
                    path: [...path],
                    patchPath: [...patchPath, "additionalItems"],
                    fieldDefinitionMap: fieldDefinitionMap,
                    patchPathToSchemaPathMap: patchPathToSchemaPathMap,
                    metaDataMap: metaDataMap,
                    errorPathMaps: errorPathMaps,
                    skeletonSchemaMap: skeletonSchemaMap,
                    parentSchema: schema
                });
            }
        }
    } else {
        skeletonSchemaMap.set(pathToPatchString([...path, 'items']), {type: schema.items.type});
        const errorSchemaPathMap = errorPathMaps.get('schema');
        const errorDataPathMap = errorPathMaps.get('data');
        const subSchemaPathMap = errorPathMaps.get('subSchema');
        const subPatchPath = [...patchPath, "0"];
        const patchPathStr = pathToPatchString(subPatchPath);
        errorSchemaPathMap.set(pathToPatchString([...path, "items"]), [...subPatchPath]);
        errorSchemaPathMap.set(pathToPatchString([...path, "items", "0"]), [...subPatchPath]);
        errorDataPathMap.set(patchPathStr, subPatchPath);
        subSchemaPathMap.set(patchPathStr, schema.items);
        setPatchPathSchema(patchPathToSchemaPathMap, [...path, 'items'], [...patchPath], 0);
        assignFieldDefinition(buildSchemaTree([...path, "items"], {...schema.items}, skeletonSchemaMap), fieldDefinitionMap, [...path, "items"], [[...path]]);
        buildFieldDefinitionMapR({
            schema: schema.items,
            propName: "items",
            path: [...path],
            patchPath: [...subPatchPath],
            fieldDefinitionMap: fieldDefinitionMap,
            patchPathToSchemaPathMap: patchPathToSchemaPathMap,
            metaDataMap: metaDataMap,
            errorPathMaps: errorPathMaps,
            skeletonSchemaMap: skeletonSchemaMap,
            parentSchema: schema
        });
    }
    assignFieldDefinition(fieldDefinitionMap.get(pathToPatchString(path)).schema, fieldDefinitionMap, [...path, 'items'], [[...path]]);
}

/**
 * Axx stands for AnyOf or AllOf
 *
 * @param {[]} axxOfSchema
 * @param {string} axxOfPropType
 * @param {string} propName
 * @param {[]} path
 * @param {[]} patchPath
 * @param {Map|ObservableMap} patchPathToSchemaPathMap
 * @param {Map|ObservableMap} skeletonSchemaMap
 * @param {Map|ObservableMap} fieldDefinitionMap
 */
function buildAxxOfRefs(axxOfSchema, axxOfPropType, propName, path, patchPath, patchPathToSchemaPathMap, skeletonSchemaMap, fieldDefinitionMap) {
    const aOfRefCollection = new Map();
    axxOfSchema.map(schema => appendFieldReferencesR(aOfRefCollection, schema, propName, [...path], patchPath, patchPathToSchemaPathMap));
    if(aOfRefCollection && aOfRefCollection.size > 0) {
        assignFieldDefinitions(aOfRefCollection, buildSchemaTree([...path], {[axxOfPropType]: [...axxOfSchema]}, skeletonSchemaMap), fieldDefinitionMap);
    }
}

/**
 * Recursive function that generates a map of json-schemas. It takes in a global json-schema and creates sub json-schema files for each "scalar" field and adds any external
 * references to the sub schema including any required, anyOf, allOf keywords that reference the field
 * @param {[]} refProp
 * @param {String|undefined} propName
 * @param {[]} path
 * @param {Map|undefined} fieldDefinitionMap This is a map that will be mutated and will be set in tree form setting a schema for each scalar field (leaf of the tree)
 */

/* istanbul ignore next */
function buildFieldDefinitionMapR({schema, propName, path = [], patchPath = [], fieldDefinitionMap = new Map(), patchPathToSchemaPathMap = new Map(), metaDataMap = new Map(), errorPathMaps = new Map([['schema', new Map()], ['data', new Map()], ['subSchema', new Map()]]), skeletonSchemaMap = new Map(), parentSchema = {}}) {
    if(propName !== undefined) {
        path.push(propName);
    } else {
        const errorSchemaPathMap = errorPathMaps.get('schema');
        const errorDataPathMap = errorPathMaps.get('data');
        const subSchemaPathMap = errorPathMaps.get('subSchema');
        errorSchemaPathMap.set("/", []);
        errorDataPathMap.set("/", []);
        subSchemaPathMap.set("/", []);
        patchPathToSchemaPathMap.set("/", []);
    }
    if(schema.type) {
        switch(schema.type) {
            case 'object':
                skeletonSchemaMap.set(pathToPatchString(path), {type: 'object'});
                //setObjectErrorMessages mutates schema which is weird.
                //To combat this weirdness it is imperative that it comes before anything else that uses in this method
                setObjectErrorMessages(schema);
                buildFieldObjectSchema(schema, path, patchPath, fieldDefinitionMap, patchPathToSchemaPathMap, metaDataMap, errorPathMaps, skeletonSchemaMap);
                assignMetaData({...schema}, [...patchPath], metaDataMap);
                break;
            case 'array':
                skeletonSchemaMap.set(pathToPatchString(path), {type: 'array'});
                setArrayLengthErrorMessage(schema);
                setArrayLengthErrorMessage(skeletonSchemaMap);
                buildFieldArraySchema(schema, path, patchPath, fieldDefinitionMap, patchPathToSchemaPathMap, metaDataMap, errorPathMaps, skeletonSchemaMap);
                assignMetaData({...schema}, [...patchPath], metaDataMap);
                break;
            case 'string':
                setStringErrorMessages(schema);
                setTypeErrorMessage(schema);
                assignMetaData({...schema}, [...patchPath], metaDataMap);
                break;
            case 'integer':
            case 'number':
                setNumberRangeErrorMessage(schema);
                assignMetaData({...schema}, [...patchPath], metaDataMap);
                break;
            default:
                setTypeErrorMessage(schema);
        }
        if(schema.anyOf && schema.anyOf.length > 0) {
            setAnyOfErrorMessages(schema.anyOf, schema);
            buildAxxOfRefs(schema.anyOf, "anyOf", propName, path, patchPath, patchPathToSchemaPathMap, skeletonSchemaMap, fieldDefinitionMap);
        }
    } else if(schema.anyOf && schema.anyOf.length > 0) {
        setAnyOfErrorMessages(schema.anyOf, parentSchema.type === 'array' ? parentSchema : schema);
        buildAxxOfRefs(schema.anyOf, "anyOf", propName, path, patchPath, patchPathToSchemaPathMap, skeletonSchemaMap, fieldDefinitionMap);
        assignMetaData({...schema}, [...patchPath], metaDataMap);
    }

    if(schema.allOf && schema.allOf.length > 0) {
        //@todo pre process allOf to generate custom error messages
        assignMetaData({...schema}, [...patchPath], metaDataMap);
        buildAxxOfRefs(schema.allOf, "allOf", propName, path, patchPath, patchPathToSchemaPathMap, skeletonSchemaMap, fieldDefinitionMap);
    }

    return [fieldDefinitionMap, patchPathToSchemaPathMap, metaDataMap, errorPathMaps];
}


/**
 *
 * @param {*} obj
 * @param {Function} mapFunction
 */

/* istanbul ignore next */
function mapObject(obj, mapFunction) {
    const keys = Object.keys(obj);
    if(keys.length > 0) {
        return keys.map(key => {
            return mapFunction(obj[key], key);
        });
    }
    return [];
}

/**
 *
 * @param {[]} path
 * @param {{}} leafValue
 * @param {Map} schemaMap a map where the key is a string path and the value is an object with only a type property that is a string that can be used as the base object
 */

/* istanbul ignore next */
function buildSchemaTree(path, leafValue = {}, basicSchemaMap = new Map()) {
    if(path.length > 0) {
        let pathStr = "";
        let schema = {type: "object"};
        const schemaRef = schema;
        const end = path.length - 1;
        for(let i = 0; i < end; i++) {
            pathStr += `/${path[i]}`;
            schema[path[i]] = basicSchemaMap.has(pathStr) ? {...basicSchemaMap.get(pathStr)} : {};
            schema = schema[path[i]];
        }
        schema[path[end]] = leafValue;
        //This is very important that it returns schemaRef.properties
        //The returned tree starts with the first path item attached to properties
        //We do NOT want to return the root schemaRef object that would be bad... I'm talking Ghostbuster's crossing the streams bad
        return {...schemaRef};
    } else {
        return leafValue;
    }
}

/**
 *
 * @param {Map} refs
 * @param {Map} fieldDefinitionMap
 * @param {{}} mergeSchema
 * @param {[]} path
 */

/* istanbul ignore next */
function assignFieldDefinitions(refs, schema, fieldDefinitionMap) {
    // const refPatchPaths = [...refs].map(pathArr => pathToPatchString(pathArr));
    // eslint-disable-next-line no-unused-vars
    for(let [, fieldPath] of refs) {
        assignFieldDefinition(schema, fieldDefinitionMap, fieldPath, [...refs.values()]);
    }
}

/* istanbul ignore next */
function assignFieldDefinition(schema, fieldDefinitionMap, path = [], refs = []) {
    // @todo: Filter out recursive refs...
    const fieldPathId = pathToPatchString(path);
    if(fieldDefinitionMap.has(fieldPathId)) {
        const fDef = fieldDefinitionMap.get(fieldPathId);
        Object.assign(fDef.schema, {...schema});
        refs.map(refPath => setRefPath(fDef.refs, [...refPath]));
    } else {
        fieldDefinitionMap.set(fieldPathId, {schema: {...schema}, path: [...path], refs: new Map(refs.map(refPath => [pathToPatchString(refPath), [...refPath]]))});
    }
}

export function pathToPatchString(path, sep = "/") {
    return sep + path.join(sep);
}

/**
 *
 * @param {{}} schema
 * @param {String} propName
 * @param {[]} path
 */

/* istanbul ignore next */
function appendFieldReferencesR(refMap, schema, propName, path = [], patchPath, patchPathToSchemaPathMap = new Map()) {
    for(let schemaProp of Object.keys(schema)) {
        switch(schemaProp) {
            case 'required':
                if(schema[schemaProp].length > 0) {
                    appendRefs(refMap, [...schema[schemaProp].map(p => {
                        return patchPathToSchemaPathMap.get(pathToPatchString([...patchPath, p]));
                    })]);
                }
                break;
            case 'dependencies':
                //skip these are processed separately
                break;
            case 'anyOf':
            case 'allOf':
                schema[schemaProp].map(anyOf => appendFieldReferencesR(refMap, anyOf, propName, path, patchPath, patchPathToSchemaPathMap));
                break;
            case 'type':
                switch(schemaProp) {
                    case 'object':
                        for(let p of Object.keys(schema.properties)) {
                            appendFieldReferencesR(refMap, schema.properties[p], propName, [...path, 'properties', p], [...patchPath, p], patchPathToSchemaPathMap);
                        }
                        break;
                    case 'array':
                        appendFieldReferencesR(refMap, schema.items, propName, [...path, 'items'], patchPath, patchPathToSchemaPathMap);
                        break;
                    case 'string':
                    case 'number':
                    case 'integer':
                    case 'boolean':
                        appendRefs(refMap, [...path, propName]);
                        break;
                }
                break;
            case 'if':
                console.warn("The 'if' keyword is not currently fully supported so you may get some differences between imperative and declarative validation");
        }
    }
}

/**
 *
 * @param {Map} refMap
 * @param {Map|Set|Array} ref2
 */
/* istanbul ignore next */
function appendRefs(refMap, ref2) {
    if(isMapLike(ref2)) {
        for(const ref of ref2.values()) {
            setRefPath(refMap, ref);
        }
    } else if(isSetLike(ref2) || isArrayLike(ref2)) {
        for(const ref of ref2) {
            setRefPath(refMap, ref);
        }
    } else if(ref2) {
        throw new Error("Tried to combined some weird refs there is a bug somewhere");
    }
}

/**
 *
 * @param {Map} refs
 * @param {string[]} path
 */
/* istanbul ignore next */
function setRefPath(refs, path) {
    const pathStr = pathToPatchString(path);
    if(!refs.has(pathStr)) {
        refs.set(pathStr, path);
    }
}

/**
 *
 * @param {{}} schema Root json schema must have a definitions property and all references must be parsed fully
 * @param {*} data Mobx State Tree
 * @param {Ajv.ajv} ajv
 * @param {{validationSanitizer: function}} options
 * @returns {{errors: ObservableMap<any, any>, fieldMetaDataMap: ObservableMap<any, any>,  validate: function}}
 */
export function watchForPatches(schema, data, ajv, options) {
    // console.log(JSON.stringify(schema, null, 2));
    const {validationSanitizer} = options;
    const errors = observable.map();
    const paths = observable.map();
    const validators = new Map();
    //build field validators
    const [fieldDefinitionMap, patchPathToSchemaPathMap, fieldMetaDataMap, errorPathMaps] = buildFieldDefinitionMapR({schema: schema});
    const schemaErrorPathMap = errorPathMaps.get('schema');
    const dataErrorPathMap = errorPathMaps.get('data');
    const subSchemaPathMap = errorPathMaps.get('subSchema');

    for(let [path, {schema: fieldDefinition, refs}] of fieldDefinitionMap) {
        // console.debug(path);
        // console.debug(fieldDefinition);
        const errorPath = schemaErrorPathMap.get(path);//ajvStringToPath(fieldDefinition.errorPath || path).filter((_, idx) => (idx > 0))
        validators.set(path, {
            validate: ajv.compile(fieldDefinition),
            subSchema: subSchemaPathMap.get(pathToPatchString(errorPath)),
            errorPath: errorPath,
            refs: refs
        });
    }
    // console.log(JSON.stringify(schema, null, 2));
    //build root avj schema
    onPatch(data, patch => {
        const skipPaths = new Set();
        const [normalizedPatchPath, errorPathSubstitutionMap] = getNormalizedPathFromPatchPath(patch.path, subSchemaPathMap);
        const schemaPath = patchPathToSchemaPathMap.get(normalizedPatchPath);
        if(!patchPathToSchemaPathMap.has(patch.path)) {
            patchPathToSchemaPathMap.set(patch.path, schemaPath);
            dataErrorPathMap.set(patch.path, ajvStringToPath(patch.path));
            // } else{
            //     // normalizedPatchPath = patch.path;
            //     schemaPath = patchPathToSchemaPathMap.get(patch.path);
        }
        if(schemaPath) {
            const schemaPathStr = pathToPatchString(schemaPath);

            // console.log("OP MAYBE???", schemaPathStr, toJS((data)));
            if(validators.has(schemaPathStr)) {
                // console.warn(`Observable Patch Detected for ${schemaPathStr}`, patch.path, normalizedPatchPath, patch.op, patch.value);
                switch(patch.op) {
                    case 'add':
                    case 'replace':
                    case 'remove':
                        // console.log(toJS(data));
                        // console.log("OP was definitely detected", schemaPathStr, toJS((data)));
                        runValidatorR([...schemaPath], validators, data, errors, paths, errorPathMaps, errorPathSubstitutionMap, skipPaths, validationSanitizer);
                        break;
                    // default:
                    //     console.warn(`Couldn't handle patch operation ${patch.op} for ${patch.path}.`);
                }
            // } else {
            //     console.warn(`COULD NOT FIND VALIDATOR FOR`, schemaPath, patch.path, patch.op, patch.value, ". This may be due to a mismatch between your schema and your stateTree or it could be a bug in form-capacitor.");
            }
        // } else {
        //     console.warn(`COULD NOT FIND PATH FOR`, patch.path, normalizedPatchPath, patch.op, patch.value, ". This may be due to a mismatch between your schema and your stateTree or it could be a bug in form-capacitor.");
        }
    });

    const validate = ajv.compile(schema);
    return {
        errors,
        fieldMetaDataMap,
        validate: (stateTreeData) => {
            errors.clear();
            if(!validate(stateTreeData)) {
                processAjvErrors(validate.errors, paths, errorPathMaps, (validationPath, errorMapPath, originPath, error, subSchema) => {
                    const checkSchema = subSchema || error.parentSchema;
                    setError(errors, errorMapPath, transformAjvErrorToValidationError(replaceErrorMessage(error, validate.errors), validationPath, checkSchema), originPath);
                });
                return false;
            } else {
                return true;
            }
        },
    };
}

/**
 *
 * @param path
 * @param {{}} validators
 * @param data
 * @param errors
 * @param paths
 * @param errorPathMaps
 * @param {Set} skipPaths
 */

/* istanbul ignore next */
function runValidatorR(path, validators, data, errors, paths, errorPathMaps, errorPathSubstitutionMap, skipPaths = new Set(), validationSanitizer) {
    const pathStr = pathToPatchString(path);
    if(!skipPaths.has(pathStr) && validators.has(pathStr)) {
        skipPaths.add(pathStr);
        const {validate, refs, errorPath} = validators.get(pathStr);
        let computedErrorPath = [...errorPath];
        if(computedErrorPath.length > 0 && errorPathSubstitutionMap && errorPathSubstitutionMap.size > 0) {
            for(const [subKey, subValue] of errorPathSubstitutionMap.entries()) {
                if(subKey >= computedErrorPath.length) {
                    break;
                } else {
                    computedErrorPath[subKey] = subValue;
                }
            }
        }
        // console.log("NOPE");
        const theRealJs = validationSanitizer(toJS(data));
        // console.log(pathStr, validate.schema, theRealJs);
        if(validate(theRealJs)) {
            // console.log("PASSED");
            // console.debug(JSON.stringify(toJS(errors),null,2));
            deleteAllNodes(errors, [...computedErrorPath]);
        } else {
            // console.log("FAILED");
            // console.log(JSON.stringify(validate.schema));
            // console.log(validate.errors);
            try {
                const reducedErrors = reduceAjvErrorsToPathMappedErrors(validate.errors, paths, errorPathMaps, (validationPath, errorMapPath, originPath, error, subSchema) => {
                    const prettyError = transformAjvErrorToValidationError(replaceErrorMessage(error, validate.errors), errorMapPath, subSchema);
                    // if(!hasError(errors, errorMapPath, prettyError, originPath)) {
                    setError(errors, errorMapPath, prettyError, originPath);
                    // }
                    return [pathToPatchString(errorMapPath), prettyError];
                }, [...computedErrorPath]);
                if(reducedErrors.size === 0) {
                    deleteAllNodes(errors, computedErrorPath);
                } else {
                    deleteAllThatAreNotInMap(errors, computedErrorPath, reducedErrors);
                }
            } catch(err) {
                throw new SchemaValidationError();
            }
        }
        //Validate References
        for(let refPath of refs.values()) {
            runValidatorR(refPath, validators, data, errors, paths, errorPathMaps, errorPathSubstitutionMap, skipPaths, validationSanitizer);
        }
    }
}

/**
 * @param {string} pathStr
 * @param {string} sep
 * @returns {string[]}
 */
export function ajvStringToPath(pathStr, sep = "/") {
    const pathArr = pathStr.split(sep);
    //shift off the first element as AJV paths always start with a leading slash '/some/ajv/path'
    pathArr.shift();
    return pathArr;
}

/* istanbul ignore next */
function sameParentBranch(path1, path2) {
    const end = Math.min(path1.length, path2.length) - 1;
    for(let i = 0; i < end; i++) {
        if(path1[i] !== path2[i]) {
            return false;
        }
    }
    return true;
}

/**
 *
 * @param {string} patchPath
 * @param {ObservableMap|Map} schemaMap
 * @returns {string}
 */

/* istanbul ignore next */
function getNormalizedPathFromPatchPath(patchPath, schemaMap) {
    const path = ajvStringToPath(patchPath);
    let normalizedPatchPath = "";
    let testPath = [];
    let substitutionMap = new Map();
    for(let i = 0; i < path.length; i++) {
        let patched = false;
        const key = path[i];
        if(testPath.length > 0 && /^\d+$/.test(key)) {
            const testPatchString = pathToPatchString([...testPath]);
            if(schemaMap.has(testPatchString)) {
                const schema = schemaMap.get(testPatchString);
                if(schema.type === 'array' && !schemaMap.has(pathToPatchString([...testPath, key]))) {
                    if(key !== '0') {
                        substitutionMap.set(i, key);
                    }
                    normalizedPatchPath += "/0";
                    testPath.push('0');
                    patched = true;
                }
            }
        }
        if(!patched) {
            normalizedPatchPath += `/${key}`;
            testPath.push(key);
        }
    }
    return [normalizedPatchPath, substitutionMap];
}