import {observable, ObservableMap, toJS} from 'mobx';
import {isBoolean, isArray} from './helpers';
import Ajv from "ajv";
import stringToPath from "./stringToPath";
import {onPatch} from "mobx-state-tree";
import UndefinedPropertyError from "./UndefinedPropertyError";
import SchemaValidationError from "./SchemaValidationError";
import mobxStateTreeToAjvFriendlyJs from "./mobxStateTreeToAjvFriendlyJs";
import {delErrorNode, setError} from "./errorMapping";

//This object contains actions for mapping special error cases based on schema type and error keyword combo
/* istanbul ignore next */

function defaultActionCallBack(errCallback, path, error, subSchemaPathMap){
    const fullPath  = [...path, error.params.missingProperty];
    errCallback(fullPath, error, subSchemaPathMap.get(pathToPatchString(fullPath)));
}
const errTypeKeywordActions = {
    /**
     * Processes required to see if there are children that need to be targeted
     * @param errCallback
     * @param path
     * @param error
     */
    "object-required": defaultActionCallBack,
    /**
     * Processes if keyword to see if there are children that need to be targeted
     * @param errCallback
     * @param path
     * @param error
     */
    "object-if": defaultActionCallBack,
    /**
     * Processes dependecies keyword to see if there are children that need to be targeted
     * @param errCallback
     * @param path
     * @param error
     * @param {Map} subSchemaPathMap
     * @param dupeMap
     */
    "object-dependencies": (errCallback, path, error, subSchemaPathMap, dupeMap) => {
        //check keyword, missingProperty and  path so we don't have duplicate errors
        const checkKey = `.object-dependencies-${path.join("-")}-${error.params.missingProperty}`;
        if(!dupeMap.has(checkKey)) {
            const fullPath  = [...path, error.params.missingProperty];
            errCallback(fullPath, error, subSchemaPathMap.get(pathToPatchString(fullPath)));
            // setError(errMap, [...path, error.params.missingProperty], error);
            dupeMap.set(checkKey, error);
        }
    },
    "required": defaultActionCallBack,
    "dependencies": defaultActionCallBack,
    "oneOf": () => {
    },
    "anyOf": () => {
    },
    "allOf": () => {
    }
};
/* istanbul ignore next */
/**
 * This function runs through the error map and transforms the errors into a tree.
 * This is so the errors can be applied to the appropriate observables and be used to highlight inputs
 * @param {array} errors
 * @param {ObservableMap} pathMap
 * @returns {ObservableMap}
 */

/* istanbul ignore next */
function processAjvErrors(errors, pathMap, errorPathMaps, errCallback) {
    const dupeMap = new Map();
    const schemaErrorPathMap = errorPathMaps.get("schema");
    const dataErrorPathMap = errorPathMaps.get("data");
    const subSchemaPathMap = errorPathMaps.get("subSchema");
    // console.log("pathMap", toJS(pathMap));
    errors.map(error => {
        // console.log("Error.path",error.dataPath);
        //Skip any errors missing a parent schema
        if(error.parentSchema !== false) {
            const dataStr = `data:#${error.dataPath}`;
            const schemaStr = `schema:${error.schemaPath}`;
            let path = [];
            if (error.dataPath !== undefined) {
                if (error.dataPath) {
                    path = dataErrorPathMap.has(error.dataPath) ? dataErrorPathMap.get(error.dataPath) : toJS(getClosestAjvPath(dataStr, pathMap)).slice(1) || [];
                }
            } else  {
                const testPath = error.schemaPath.substr(1, error.schemaPath.length - 1);
                path = schemaErrorPathMap.has(testPath) ? schemaErrorPathMap.get(testPath) : toJS(getClosestAjvPath(schemaStr, pathMap)).slice(1) || [];
            }
            //shift off first element
            // path.shift();
            //Check error message to process complex errors to see if we need to add more to the path or more errors
            const actionKey =`${error.parentSchema.type}-${error.keyword}`;
            // console.log(path, error.dataPath ? dataStr : schemaStr);
            // console.log(error);
            if(path.length > 0 && error.parentSchema.type && errTypeKeywordActions[actionKey]) {
                errTypeKeywordActions[actionKey](errCallback, path, error, subSchemaPathMap, dupeMap);
            } else if(errTypeKeywordActions[error.keyword]) {
                errTypeKeywordActions[error.keyword](errCallback, path, error, subSchemaPathMap, dupeMap);
            } else {
                errCallback(path, error, subSchemaPathMap.get(path));
            }
        }
    });
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
function beautifyAjvError(error, path, subSchema) {
    const schema = subSchema || error.parentSchema;
    return createError(schema.title , schema.errorMessage || error.message, path, error.keyword);
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

function setPatchPathSchema(patchPathToSchemaPathMap, schemaPath, rootPatchPath, leafName){
    patchPathToSchemaPathMap.set(pathToPatchString([...rootPatchPath, leafName]), [...schemaPath]);
}

function assignMetaData(metaData, path, metaDataMap) {
    // @todo: Filter out recursive refs...
    const fieldPathId = pathToPatchString(path);
    if (metaDataMap.has(fieldPathId)) {
        const mapInst = metaDataMap.get(fieldPathId);
        Object.assign(mapInst, metaData);
    } else {
        metaDataMap.set(fieldPathId, {...metaData});
    }
}

/**
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
function buildFieldObjectSchema(schema, path, patchPath, fieldDefinitionMap, patchPathToSchemaPathMap, relatedRefMap, metaDataMap, errorPathMaps, skeletonSchemaMap) {
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
                relatedRefMap: relatedRefMap,
                metaDataMap: metaDataMap,
                errorPathMaps: errorPathMaps,
                skeletonSchemaMap: skeletonSchemaMap
            });
            setPatchPathSchema(patchPathToSchemaPathMap, [...path, 'properties', p], [...patchPath], p);
            assignFieldDefinition(buildSchemaTree([...path, 'properties', p], {...property}, skeletonSchemaMap), fieldDefinitionMap, [...path, 'properties', p], schema.dependencies !== undefined ? getDependencyRefs(schema.dependencies, p, path, patchPath, patchPathToSchemaPathMap) : []);
            baseProperties[p] = {type: property.type, anyOf: property.anyOf, allOf: property.allOf};
        }
    }
    if(schema.required && schema.required.length > 0) {
        // Going to assign each root object/field level required to itself unlike anyOf or allOf
        // because each field can decide whether it is required on its own unless they are in a
        // codependent anyOf or allOf validation
        schema.required.map(p => {
            assignFieldDefinition(buildSchemaTree(path, {required: [p]}, skeletonSchemaMap), fieldDefinitionMap, patchPathToSchemaPathMap.get(pathToPatchString([...patchPath, p])));
            assignMetaData({required: true}, [...patchPath, p], metaDataMap);
        });

        // assignFieldDefinitions(new Set(schema.required.map(p => {
        //      return patchPathToSchemaPathMap.get(pathToPatchString([...patchPath, p]));
        //  })), buildSchemaTree(path, {required: [p]}), fieldDefinitionMap);
    }
    if(schema.dependencies) {
        mapObject(schema.dependencies, (dependency, p) => {
            const depSchema = {properties: baseProperties, dependencies: {...schema.dependencies}};
            if(Array.isArray(dependency)){
                patchPathToSchemaPathMap.set(pathToPatchString([...patchPath, p]), [...path, 'properties', p]);
                assignFieldDefinition(buildSchemaTree(path, depSchema, skeletonSchemaMap), fieldDefinitionMap, patchPathToSchemaPathMap.get(pathToPatchString([...patchPath, p])));
                // console.log(JSON.stringify(fieldDefinitionMap.get(pathToPatchString(patchPathToSchemaPathMap.get(pathToPatchString([...patchPath, p]))))));
            } else if(dependency && dependency.properties) {
                patchPathToSchemaPathMap.set(pathToPatchString([...patchPath, p]), [...path, 'properties', p]);
                assignFieldDefinition(buildSchemaTree(path, depSchema, skeletonSchemaMap), fieldDefinitionMap, patchPathToSchemaPathMap.get(pathToPatchString([...patchPath, p])));
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
function buildFieldArraySchema(schema, path, patchPath, fieldDefinitionMap, patchPathToSchemaPathMap, relatedRefMap, metaDataMap, errorPathMaps, skeletonSchemaMap) {
    assignFieldDefinition(buildSchemaTree([...path], {...schema}, skeletonSchemaMap), fieldDefinitionMap, [...path], []);
    if(isArray(schema.items)) {
        schema.items.forEach((item,itemIdx) => {
            const errorSchemaPathMap = errorPathMaps.get('schema');
            const errorDataPathMap = errorPathMaps.get('data');
            const subSchemaPathMap = errorPathMaps.get('subSchema');
            const subPatchPath = [...patchPath, itemIdx];
            const patchPathStr = pathToPatchString(subPatchPath);
            errorSchemaPathMap.set(pathToPatchString([...path, "items", itemIdx]), subPatchPath);
            errorDataPathMap.set(patchPathStr, subPatchPath);
            subSchemaPathMap.set(patchPathStr, schema.items[itemIdx]);
            setPatchPathSchema(patchPathToSchemaPathMap, [...path, 'items'], [...patchPath], itemIdx);
            assignFieldDefinition(buildSchemaTree([...path, "items", itemIdx], {...schema.items[itemIdx]}, skeletonSchemaMap), fieldDefinitionMap, [...path, "items", itemIdx], [[...path]]);
            buildFieldDefinitionMapR({
                schema: schema.items[itemIdx],
                propName: itemIdx,
                path: [...path, 'items'],
                patchPath: [...subPatchPath],
                fieldDefinitionMap: fieldDefinitionMap,
                patchPathToSchemaPathMap: patchPathToSchemaPathMap,
                relatedRefMap: relatedRefMap,
                metaDataMap: metaDataMap,
                errorPathMaps: errorPathMaps,
                skeletonSchemaMap: skeletonSchemaMap
            });
        });
        if(schema.additionalItems){
            const additionalItemsPath = [...patchPath, "additionalItems"];
            const errorSchemaPathMap = errorPathMaps.get('schema');
            const errorDataPathMap = errorPathMaps.get('data');
            const subSchemaPathMap = errorPathMaps.get('subSchema');
            errorSchemaPathMap.set(pathToPatchString([...path, "additionalItems"]), additionalItemsPath);
            errorDataPathMap.set(pathToPatchString(additionalItemsPath) , additionalItemsPath);
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
                    relatedRefMap: relatedRefMap,
                    metaDataMap: metaDataMap,
                    errorPathMaps: errorPathMaps,
                    skeletonSchemaMap: skeletonSchemaMap
                });
            }
        }
    } else {
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
            relatedRefMap: relatedRefMap,
            metaDataMap: metaDataMap,
            errorPathMaps: errorPathMaps,
            skeletonSchemaMap: skeletonSchemaMap
        });
    }
    assignFieldDefinition(fieldDefinitionMap.get(pathToPatchString(path)).schema, fieldDefinitionMap, [...path, 'items'], [[...path]]);
}

/**
 * Recursive function that generates a map of json-schemas. It takes in a global json-schema and creates sub json-schema files for each "scalar" field and adds any external
 * references to the sub schema including any required, anyOf, allOf keywords that reference the field
 * @param {{}|undefined} schema
 * @param {String|undefined} propName
 * @param {[]} path
 * @param {Map|undefined} fieldDefinitionMap This is a map that will be mutated and will be set in tree form setting a schema for each scalar field (leaf of the tree)
 */
/* istanbul ignore next */
function buildFieldDefinitionMapR({schema, propName, path = [], patchPath = [], fieldDefinitionMap = new Map(), patchPathToSchemaPathMap = new Map(), relatedRefMap = new Map(), metaDataMap = new Map(), errorPathMaps = new Map([['schema',new Map()], ['data', new Map()], ['subSchema', new Map()]]), skeletonSchemaMap = new Map()}) {
    if(propName !== undefined) {
        path.push(propName);
    }

    switch(schema.type) {
        case 'object':
            skeletonSchemaMap.set(pathToPatchString(path), {type: 'object'});
            buildFieldObjectSchema(schema, path, patchPath, fieldDefinitionMap, patchPathToSchemaPathMap, relatedRefMap, metaDataMap, errorPathMaps, skeletonSchemaMap);
            break;
        case 'array':
            skeletonSchemaMap.set(pathToPatchString(path), {type: 'array'});
            buildFieldArraySchema(schema, path, patchPath, fieldDefinitionMap, patchPathToSchemaPathMap, relatedRefMap, metaDataMap, errorPathMaps, skeletonSchemaMap);
            break;
    }

    let refCollection = [];

    if(schema.anyOf && schema.anyOf.length > 0) {
        const anyOfRefCollection = new Set(schema.anyOf.reduce((acc, anyOfSchema) => {
            return [...acc, ...getFieldReferencesR(anyOfSchema, propName,[...path], patchPath, patchPathToSchemaPathMap)];
        },[]));
        if(anyOfRefCollection && anyOfRefCollection.size > 0) {
            assignFieldDefinitions(anyOfRefCollection, buildSchemaTree([...path], {anyOf: [...schema.anyOf]}, skeletonSchemaMap), fieldDefinitionMap);
            refCollection = [...anyOfRefCollection];
        }
     }
    
    if(schema.allOf && schema.allOf.length > 0) {
        const allOfRefCollection = new Set(schema.allOf.reduce((acc, allOfSchema) => {
            return [...acc, ...getFieldReferencesR(allOfSchema, propName,[...path], patchPath, patchPathToSchemaPathMap)];
        },[]));
        if(allOfRefCollection && allOfRefCollection.size > 0) {
            assignFieldDefinitions(allOfRefCollection, buildSchemaTree([...path], {allOf: [...schema.allOf]}, skeletonSchemaMap), fieldDefinitionMap);
            refCollection = [...refCollection, ...allOfRefCollection];
        }
     }

    relatedRefMap.set([...relatedRefMap], refCollection);

    return [fieldDefinitionMap, patchPathToSchemaPathMap, metaDataMap, errorPathMaps];//MAYBE ADD A REFMAP HERE THAT WILL hold refs to fields so that you can fire related validators based on that if they exist?
}


/**
 *
 * @param {*} obj
 * @param {Function} mapFunction
 */
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
    if (path.length > 0) {
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
 * @param {Set} refs
 * @param {Map} fieldDefinitionMap
 * @param {{}} mergeSchema
 * @param {[]} path
 */

/* istanbul ignore next */
function assignFieldDefinitions(refs, schema, fieldDefinitionMap) {
    // const refPatchPaths = [...refs].map(pathArr => pathToPatchString(pathArr));
    for (let fieldPath of refs) {
        assignFieldDefinition(schema, fieldDefinitionMap ,fieldPath, refs);
    }
}

/* istanbul ignore next */
function assignFieldDefinition(schema, fieldDefinitionMap, path = [], refs = [], errorPath = undefined) {
    // @todo: Filter out recursive refs...
    const fieldPathId = pathToPatchString(path);
    if (fieldDefinitionMap.has(fieldPathId)) {
        updateFieldDefinition(fieldDefinitionMap.get(fieldPathId), {schema: {...schema}, refs: new Set([...refs])});
    } else {
        fieldDefinitionMap.set(fieldPathId, {schema: {...schema}, refs: new Set([...refs]), path: [...path], errorPath: errorPath });
    }
}

/* istanbul ignore next */
function updateFieldDefinition(fieldDefinition ,...fieldDefinitions){
    fieldDefinitions.forEach(({schema, refs}) => Object.assign(fieldDefinition, {schema: schema ? mergeObjects(fieldDefinition.schema, schema) : fieldDefinition.schema, refs: refs ? new Set([...refs, ...fieldDefinition.refs]) : fieldDefinition.refs}));
}

/* istanbul ignore next */
function mergeObjects(...schemas) {
    return Object.assign({}, ...schemas);
}

export function pathToPatchString(path, sep = "/") {
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
                if (schema[schemaProp].length > 0) {
                    refs = new Set([...refs, ...schema[schemaProp].map(p => {
                        return patchPathToSchemaPathMap.get(pathToPatchString([...patchPath, p]));
                    })]);
                }
                break;
            case 'dependencies':
                //skip these are processed separately
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

function getDependencyRefs(dependencySchema, propName, path, patchPath, patchPathToSchemaPathMap){
    return new Set([...mapObject(dependencySchema, (dependency, p) => {
        if(Array.isArray(dependency) && dependency.includes(propName)){
            return [...path, 'properties', p];
        } else if (dependency && dependency.properties){
            for(let targetPropName of Object.keys(dependency.properties)) {
                const objSubSet = getFieldReferencesR(dependency.properties[targetPropName], targetPropName, [...path, 'properties', targetPropName], [...patchPath, targetPropName], patchPathToSchemaPathMap);
                if(objSubSet.has(propName)){
                    return [...path, 'properties', targetPropName];
                }
            }
        }
    }).filter(x => x)]);
}

/**
 * watches a MobXStateTree Object for patches then updates which a map of which fields are required and runs validation for errors using a dereferenced json_schema
 * @param {{}} schema Root json schema must have a definitions property and all references must be parsed fully
 * @param {{}} data {MobXStateTree} object
 * @param {{}} ajv {Ajv} object
 * @returns {{errors: ObservableMap<any, any>, validate: validate}}
 */
export function watchForPatches(schema, data, ajv) {
    const errors = observable.map();
    const paths = observable.map();
    const validators = new Map();
    //build field validators
    const [fieldDefinitionMap, patchPathToSchemaPathMap, metaDataMap, errorPathMaps] = buildFieldDefinitionMapR({schema: schema});

    const schemaErrorPathMap = errorPathMaps.get('schema');
    const subSchemaPathMap = errorPathMaps.get('subSchema');

    for (let [path ,{schema:fieldDefinition, refs}] of fieldDefinitionMap) {
        // console.debug(path);
        // console.debug(fieldDefinition);
        const errorPath = schemaErrorPathMap.has(path) ? schemaErrorPathMap.get(path) : ajvStringToPath(fieldDefinition.errorPath || path).filter((_, idx) => (idx > 0));
        validators.set(path, {
            validate: ajv.compile(fieldDefinition),
            subSchema: subSchemaPathMap.get(pathToPatchString(errorPath)),
            errorPath: errorPath,
            refs: refs
        });
    }
    //build root avj schema
    onPatch(data, patch => {
        const schemaPath = getSchemaPathFromPatchPath(patch.path, patchPathToSchemaPathMap, subSchemaPathMap);
        // console.log("Some kind of OP", patch.op, normalizedPatchPath);
        if(schemaPath) {
            const schemaPathStr = pathToPatchString(schemaPath);
            // console.log("OP MAYBE???", schemaPathStr, toJS((data)));
            if(validators.has(schemaPathStr)) {
                // console.log(`Observable Patch Detected for ${normalizedPatchPath}`, patch.path, patch.op, patch.value);
                switch(patch.op) {
                    case 'add':
                    case 'replace':
                    case 'remove':
                        // console.log(toJS(data));
                        // console.log("OP was definitely detected", schemaPathStr, toJS((data)));

                        runValidator([...schemaPath], validators, data, errors, paths, errorPathMaps, [[...schemaPath]]);

                        break;
                    default:
                        console.warn(`Couldn't handle patch operation ${patch.op} for ${patch.path}.`);
                }
            } else {
                console.warn(`COULD NOT FIND VALIDATOR FOR`, schemaPath, patch.path, patch.op, patch.value);

            }
        } else {
            console.warn(`COULD NOT FIND PATH FOR`, patch.path, testPath, patch.op, patch.value);
        }
    });

    const validate = ajv.compile(schema);
    return {
        errors, metaDataMap, validate: (data) => {
            errors.clear();
            if(!validate(data)) {
                processAjvErrors(validate.errors, paths, errorPathMaps, (errorPath, error, subSchema)=> {
                    const checkSchema = subSchema || error.parentSchema;
                    setError(errors, [...errorPath], beautifyAjvError(error, errorPath, checkSchema));
                });
                return false;
            } else {
                return true;
            }
        },
    };
}


function validateRefs(refs, validators, data, errors, paths, errorPathMaps, skipPaths = []){
    for(let refPath of refs){
        // @todo: Filter out recursive refs... Once they are filtered this check may not be necessary...
        if(!skipPaths.includes(refPath)){
            runValidator(refPath, validators, data, errors, paths, errorPathMaps,[...skipPaths, refPath]);
        }
    }
}

// /**
//  *
//  * @param {Object[]} ajvErrors
//  * @param {string[]} errorPath
//  * @param {{}} subSchema
//  * @param {ObservableMap} errorMap
//  */
// function mapAjvErrorSet(ajvErrors, errorPath, subSchema, errorMap) {
//     if(ajvErrors.length > 0) {
//         ajvErrors.map(error => setError(errorMap, [...errorPath], beautifyAjvError(error, errorPath, subSchema)));
//     } else {
//         delErrorNode(errorMap, [...errorPath]);
//     }
// }

/**
 *
 * @param path
 * @param {{}} validators
 * @param data
 * @param errors
 * @param skipPaths
 * @param paths
 * @param errorPathMaps
 */
function runValidator(path, validators, data, errors, paths, errorPathMaps, skipPaths){
    const pathStr = pathToPatchString(path);
    if(validators.has(pathStr)){
        //validate refs first then run my validation
        const {validate, refs, errorPath} = validators.get(pathStr);
        validateRefs(refs, validators, data, errors, paths, errorPathMaps, [...skipPaths]);
        // const x = validate(toJS(data));
        // console.log("NOPE");
        const theRealJs = mobxStateTreeToAjvFriendlyJs(data);
        if(validate(theRealJs)) {
            // console.log("PASSED");
            // console.debug(JSON.stringify(toJS(errors),null,2));
            delErrorNode(errors, [...errorPath]);
        } else {
            // console.log("FAILED", subSchema);
            //Todo: Build an algorithm here that makes user friendly errors out of the base AJV errors probably better to replace the filteredErrors stuff below with a reduce that sanitises and formats the AJV errors
            try{
                processAjvErrors(validate.errors, paths, errorPathMaps, (errorPath, error, subSchema)=> {
                    setError(errors, [...errorPath], beautifyAjvError(error, errorPath, subSchema));
                });
                // mapAjvErrorSet(validate.errors.filter(err => filterJsonSchemaErrors(err, errorPath.join("/"))), errorPath, subSchema, errors);
            } catch(err) {
                throw new SchemaValidationError();
            }
        }
    }
}
// /**
//  * This is a filtering function which will return true if an error is valid and relates to the current path or false if it is not
//  * @param {{}} err
//  * @param {string} errorPath
//  * @param {{}} cache used for caching dependencies so that only 1 error message triggers
//  * @returns {boolean}
//  */
// function filterJsonSchemaErrors(err, errorPath, cache = {}){
//     //@todo: flesh this out more as required
//     switch(err.keyword) {
//         case "required":
//             return err.params.missingProperty === errorPath;
//         case "dependency":
//             if(cache.dependencies === undefined){
//                 cache.dependencies = new Map();
//             }
//             if(cache.dependencies.get(errorPath)){
//                 return false;
//             } else {
//                 cache.dependencies.set(errorPath, error);
//                 return true;
//             }
//         default:
//             return true;
//     }
// }

/**
 * @param {string} pathStr
 * @param {string} sep
 * @returns {string[]}
 */
function ajvStringToPath(pathStr, sep = "/"){
    const pathArr = pathStr.split(sep);
    //shift off the first element as AJV paths always start with a leading slash '/some/ajv/path'
    pathArr.shift();
    return pathArr;
}

/**
 * @param {string} pathStr
 * @returns {string}
 */
function normalizePatchPath(pathStr){
    return pathStr.replace(/(\/)([1-9]+[0-9]*)(\/|$)/,"$10$3");
}

/**
 *
 * @param {string} patchPath
 * @param {Map} patchPathMap
 */
function getSchemaPathFromPatchPath(patchPath, patchPathMap, schemaMap){
    if(patchPathMap.has(patchPath)){
        return patchPathMap.get(patchPath);
    }
    const path = ajvStringToPath(patchPath);
    let normalizedPatchPath = "";
    let testPath = [];
    for(let key of path) {
        if (testPath.length > 0 && /^\d+$/.test(key)) {
            const testPatchString = pathToPatchString([...testPath]);
            if(schemaMap.has(testPatchString)) {
                const schema = schemaMap.get(testPatchString);
                if(schema.type === 'array' && !schemaMap.has(pathToPatchString([...testPath, key]))) {
                    normalizedPatchPath += "/0";
                    testPath.push('0');
                    continue;
                }
            }
        }
        normalizedPatchPath += `/${key}`;
        testPath.push(key);
    }
    return patchPathMap.has(normalizedPatchPath) ? patchPathMap.get(normalizedPatchPath) : null;
}