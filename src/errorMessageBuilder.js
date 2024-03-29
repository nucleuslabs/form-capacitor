import {getValue, isArrayLike, isObject, isString} from "./helpers";
import {
    requiredKeyword,
    typeKeyword,
    anyOfType,
    anyOfRequired,
    dependenciesKeyword,
    patternKeyword,
    minMaxLength,
    minMax,
    minMaxItems, allOfRequired
} from "./errorDefinition";
import RequiredFieldDoesNotExistError from "./errorTypes/RequiredFieldDoesNotExistError";
import DependencySchemaDoesNotExistError from "./errorTypes/DependencySchemaDoesNotExistError";

/**
 * This message will mutate the schema passed in
 * @param {{}} schema
 */
export function setTypeErrorMessage(schema) {
    schema.errorMessage = getMergedErrorMessage({type: typeKeyword(schema.title, schema.type)}, schema.errorMessage);
}

/**
 * This message will mutate schema
 * @param {{}} schema
 */
export function setPatternErrorMessage(schema) {
    if(schema.pattern) {
        schema.errorMessage = getMergedErrorMessage({pattern: patternKeyword(schema.title)}, schema.errorMessage);
    }
}

export function setStringLengthErrorMessage(schema) {
    if(schema.minLength !== undefined || schema.maxLength !== undefined) {
        schema.errorMessage = getMergedErrorMessage(minMaxLength(schema.title, schema.minLength, schema.maxLength), schema.errorMessage);
    }
}

/**
 * This message will mutate schema
 * @param {{}} schema
 */
export function setNumberRangeErrorMessage(schema) {
    if(schema.minimum !== undefined || schema.maximum !== undefined || schema.exclusiveMinimum !== undefined || schema.exclusiveMaximum !== undefined) {
        if(schema.minimum !== undefined){
            if(schema.maximum !== undefined && schema.minimum > schema.maximum){
                console.warn(`Warning the json schema titled ${schema.title || "Unknown"} has a minimum that is higher than the maximum`);
            }
            if(schema.exclusiveMaximum !== undefined && schema.minimum >= schema.exclusiveMaximum){
                console.warn(`Warning the json schema titled ${schema.title || "Unknown"} has a minimum that is higher or equal to the exclusiveMaximum`);
            }
        }
        if(schema.exclusiveMinimum !== undefined){
            if(schema.maximum !== undefined && schema.exclusiveMinimum >= schema.maximum){
                console.warn(`Warning the json schema titled ${schema.title || "Unknown"} has a exclusiveMinimum that is higher than or equal to the maximum`);
            }
            if(schema.exclusiveMaximum !== undefined && schema.exclusiveMaximum - schema.exclusiveMinimum < 1){
                console.warn(`Warning the json schema titled ${schema.title || "Unknown"} has a exclusiveMinimum that not compatible with the exclusiveMaximum. They are too close in value`);
            }
        }
        schema.errorMessage = getMergedErrorMessage(
            minMax(
                schema.title,
                schema.minimum,
                schema.maximum,
                schema.exclusiveMinimum,
                schema.exclusiveMaximum
            ),
            schema.errorMessage
        );
    }
}

/**
 * This message will mutate schema
 * @param {{}} schema
 */
export function setArrayLengthErrorMessage(schema) {
    if(schema.minItems !== undefined || schema.maxItems !== undefined) {
        schema.errorMessage = getMergedErrorMessage(minMaxItems(schema.title, schema.minItems, schema.maxItems), schema.errorMessage);
    }
}

/**
 * This message will mutate the propName node of the schema
 * @param {{}} schema
 */
export function setRequiredErrorMessage(schema) {
    for(let propName of schema.required) {
        _setRequiredErrorMessage(schema, propName);
    }
}

/**
 * This message will mutate the propName node of the parentSchema
 * @param {{}} parentSchema
 * @param {string} propName
 */
/* istanbul ignore next */
function _setRequiredErrorMessage(parentSchema, propName) {
    let requiredProperty = getValue(parentSchema, ['properties', propName]);
    if(!requiredProperty){
        throw new RequiredFieldDoesNotExistError(propName, parentSchema);
    }
    requiredProperty.errorMessage = getMergedErrorMessage({
        required: requiredKeyword(requiredProperty.title || propName)
    }, requiredProperty.errorMessage);
}

/**
 * This message will mutate the parentSchema
 * @param {{}} deps
 * @param {{}} parentSchema
 */
export function setDependenciesErrorMessage(deps, parentSchema) {
    const depTitleMap = new Map();
    let flippedDependencies = mapFlippedDependencies(deps);
    for(let [level1DepName, level2DepSet] of flippedDependencies) {
        const schema = getValue(parentSchema, ["properties", level1DepName]);
        if(!schema){
            throw new DependencySchemaDoesNotExistError(level1DepName, parentSchema);
        }
        const level1Title = getSetDepTitle(level1DepName, depTitleMap, parentSchema);
        schema.errorMessage = getMergedErrorMessage(
            {
                dependencies: dependenciesKeyword(
                    level1Title,
                    Array.from(level2DepSet).map(level2DepName => {
                        let title;
                        try {
                            title = getSetDepTitle(level2DepName, depTitleMap, parentSchema);
                        } catch(e){
                            throw new DependencySchemaDoesNotExistError(level2DepName, parentSchema);
                        }
                        return title;
                    })
                )
            },
            schema.errorMessage
        );
    }
}

/**
 * fun helper function for setDependenciesErrorMessage that flips dependencies for better error messages
 * @param {{}} dependencies
 * @returns {Map<any, any>}
 */
/* istanbul ignore next */
function mapFlippedDependencies(dependencies) {
    const flipped = new Map;
    for(let level1Name of Object.keys(dependencies)) {
        const level2Dependencies = dependencies[level1Name];
        for(let level2Name of level2Dependencies) {
            if(flipped.has(level2Name)) {
                flipped.get(level2Name).add(level1Name);
            } else {
                flipped.set(level2Name, new Set([level1Name]));
            }
        }
    }
    return flipped;
}

/**
 *
 * @param {string} name
 * @param {Map} map
 * @param {{}} parentSchema
 * @returns {string}
 */
/* istanbul ignore next */
function getSetDepTitle(name, map, parentSchema) {
    if(map.has(name)) {
        return map.get(name);
    } else {
        const title = getPropertyTitle(parentSchema, name);
        map.set(name, title);
        return title;
    }
}

/**
 * This message will mutate either the anyOfSchema or the parentSchema or both
 * @param {{}} anyOfSchema
 * @param {{title: string, errorMessage: {}}} parentSchema
 */
export function setAnyOfErrorMessages(anyOfSchema, parentSchema) {
    let anyOfFullSet = anyOfSchema.reduce((acc, schema) => {
        for(let keyword of Object.keys(schema)) {
            switch(keyword) {
                case 'required':
                    if(acc.has(keyword)) {
                        acc.get(keyword).push([...schema.required]);
                    } else {
                        acc.set(keyword, [[...schema.required]]);
                    }
                    break;
                case 'type':
                    if(acc.has(keyword)) {
                        acc.get(keyword).push(schema.type);
                    } else {
                        acc.set(keyword, [schema.type]);
                    }
                    break;
                case 'properties':
                case 'anyOf':
                case 'allOf':
                case 'not':
                    if(!schema.errorMessage && !anyOfSchema.errorMessage && !parentSchema.errorMessage) {
                        console.warn(`Detected '${keyword}' nested in an anyOf schema that does not have an errorMessage property. form-capacitor does not automatically generate error messages for these nested schemas. Outputting the parent schema for reference.`, parentSchema);
                    }
                // @todo: Do we need to check properties for anyOf error message generation
                // case 'properties':
                //
                //     break;
            }
        }
        return acc;
    }, new Map());
    if(anyOfFullSet.size > 0) {
        for(let [keyword, data] of anyOfFullSet) {
            switch(keyword) {
                case "required":
                    _setAnyOfRequiredMessage(data, parentSchema, anyOfSchema);
                    break;
                case 'type':
                    parentSchema.errorMessage = getMergedErrorMessage({type: anyOfType(parentSchema.title, data)}, parentSchema.errorMessage);
                    break;
            }
        }
    }
}

/**
 * @param {[]} requiredFields
 * @param {{}} parentSchema
 * @param {{}} anyOfSchema
 * @private
 */
/* istanbul ignore next */
function _setAnyOfRequiredMessage(requiredFields, parentSchema, anyOfSchema) {
    const reqMessage = anyOfRequired(requiredFields.map(req => req.map(propName => getPropertyTitle(parentSchema, propName))));
    for(let anyOfElement of anyOfSchema) {
        anyOfElement.errorMessage = getMergedErrorMessage({required: reqMessage}, anyOfElement.errorMessage);
    }
}

/**
 * This message will mutate either the allOfSchema or the parentSchema or both
 * @param {{}} allOfSchema
 * @param {{title: string, errorMessage: {}}} parentSchema
 */
export function setAllOfErrorMessages(allOfSchema, parentSchema) {
    const frankenSchema = {
        properties: parentSchema.properties ? {...parentSchema.properties} : {}
    };
    let allOfFullSet = allOfSchema.reduce((acc, schema) => {
        for(let keyword of Object.keys(schema)) {
            switch(keyword) {
                case 'required':
                    if(acc.has(keyword)) {
                        acc.get(keyword).push([...schema.required]);
                    } else {
                        acc.set(keyword, [[...schema.required]]);
                    }
                    break;
                case 'type':
                    if(acc.has(keyword)) {
                        acc.get(keyword).push(schema.type);
                    } else {
                        acc.set(keyword, [schema.type]);
                    }
                    break;
                case 'properties':
                    if(schema.properties){
                        Object.keys(schema.properties).forEach((propName) => {
                            frankenSchema.properties[propName] = Object.assign({}, frankenSchema.properties[propName], schema.properties[propName]);
                        });
                    }
                    break;
                case 'items':
                    setAllErrorMessagesR(schema.items, parentSchema);
                    break;
                case 'anyOf':
                case 'allOf':
                case 'not':
                    if(!schema.errorMessage && !allOfSchema.errorMessage && !parentSchema.errorMessage) {
                        console.warn(`Detected '${keyword}' nested in an allOf schema that does not have an errorMessage property. form-capacitor does not automatically generate error messages for these nested schemas. Outputting the parent schema for reference.`, parentSchema);
                    }
            }
        }
        return acc;
    }, new Map());
    if(allOfFullSet.size > 0) {
        for(let [keyword, data] of allOfFullSet) {
            switch(keyword) {
                case "required":
                    parentSchema.errorMessage = getMergedErrorMessage(allOfRequiredMessage(data, frankenSchema, allOfSchema), parentSchema.errorMessage);
                    break;
                case 'type':
                    parentSchema.errorMessage = getMergedErrorMessage({type: anyOfType(parentSchema.title, data)}, parentSchema.errorMessage);
                    break;
            }
        }
    }
}

/**
 *
 * @param {[]} requiredFields
 * @param {{}} parentSchema
 * @param {{}} anyOfSchema
 * @private
 */
/* istanbul ignore next */
function allOfRequiredMessage(requiredFields, parentSchema, allOfSchema) {
    const reqMessage = allOfRequired(requiredFields.map(req => req.map(propName => getPropertyTitle(parentSchema, propName))));
    for(let allOfElement of allOfSchema) {
        if(allOfElement.required) {
            allOfElement.errorMessage = getMergedErrorMessage({required: reqMessage}, allOfElement.errorMessage);
        }
    }
    return reqMessage ? {required: reqMessage} : {};
}

/**
 *
 * @param {{}} schema
 */
export function setObjectErrorMessages(schema) {
    if(schema.required && schema.required.length > 0) {
        setRequiredErrorMessage(schema);
    }
    if(schema.dependencies) {
        setDependenciesErrorMessage(schema.dependencies, schema);
    }
}

/**
 *
 * @param {{}} schema
 */
export function setStringErrorMessages(schema) {
    setPatternErrorMessage(schema);
    setStringLengthErrorMessage(schema);
}

/**
 *
 * @param {{}} schema
 * @param {string} propName
 *
 * @returns {string}
 */
/* istanbul ignore next */
function getPropertyTitle(schema, propName) {
    const prop = getValue(schema, ['properties', propName]);
    return prop.title;
}

/**
 * This function merges custom ajv error messages to emulate the behaviour of ajv-errors https://github.com/epoberezkin/ajv-errors#usage
 * if existingErrorMessage is a string then it replaces all proper properties in the newErrorMessage with the string
 * if existingErrorMessage is an object it merges the custom error objects together
 * @param {{}} newErrorMessage
 * @param {{}|string} existingErrorMessage
 * @returns {{}}
 */
/* istanbul ignore next */
function getMergedErrorMessage(newErrorMessage, existingErrorMessage) {
    if(isString(existingErrorMessage)) {
        return Object.keys(newErrorMessage).reduce((acc, prop) => {
            acc[prop] = existingErrorMessage;
            return acc;
        }, {});
    } else if(isObject(existingErrorMessage)) {
        return Object.assign({}, newErrorMessage, existingErrorMessage);
    }
    return {...newErrorMessage};
}

/**
 *
 * @param {{}} schema
 * @param {{}} parentSchema
 */
/* istanbul ignore next */
function setAllErrorMessagesR(schema, parentSchema){
    if(schema.type) {
        switch(schema.type) {
            case 'object':
                setObjectErrorMessages(schema);
                if(schema.properties) {
                    for(let p of Object.keys(schema.properties)) {
                        setAllErrorMessagesR(schema.properties[p], schema);
                    }
                }
                break;
            case 'array':
                setArrayLengthErrorMessage(schema);
                if(isArrayLike(schema.items)) {
                    schema.items.forEach(item => {
                        setAllErrorMessagesR(item, schema);
                    });
                    if(schema.additionalItems) {
                        setAllErrorMessagesR(schema.additionalItems, schema);
                    }
                } else if(schema.items) {
                    setAllErrorMessagesR(schema.items, schema);
                }
                break;
            case 'string':
                setStringErrorMessages(schema);
                setTypeErrorMessage(schema);
                break;
            case 'integer':
            case 'number':
                setNumberRangeErrorMessage(schema);
                break;
            default:
                setTypeErrorMessage(schema);
        }
        if(schema.anyOf && schema.anyOf.length > 0) {
            setAnyOfErrorMessages(schema.anyOf, schema);
        }
    } else if(schema.anyOf && schema.anyOf.length > 0) {
        setAnyOfErrorMessages(schema.anyOf, parentSchema.type === 'array' ? parentSchema : schema);
    }
    if(schema.allOf && schema.allOf.length > 0) {
        setAllOfErrorMessages(schema.allOf, schema);
    }
}
