import {getValue, isObject, isString} from "./helpers";
import {requiredKeyword, typeKeyword, anyOfType, anyOfRequired, dependenciesKeyword, patternKeyword, minMax, minMaxItems} from "./errorDefinition.en";

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
    schema.errorMessage = getMergedErrorMessage({pattern: patternKeyword(schema.title)}, schema.errorMessage);
}

/**
 * This message will mutate schema
 * @param {{}} schema
 */
export function setNumberRangeErrorMessage(schema) {
    if(schema.minimum !== undefined || schema.maximum !== undefined || schema.exclusiveMinimum !== undefined || schema.exclusiveMaximum !== undefined) {
        schema.errorMessage = getMergedErrorMessage(minMax(schema.title, schema.minimum, schema.maximum, schema.exclusiveMinimum, schema.exclusiveMaximum), schema.errorMessage);
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
function _setRequiredErrorMessage(parentSchema, propName) {
    let requiredProperty = getValue(parentSchema, ['properties', propName]);
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
    for(let me of Object.keys(deps)) {
        const schema = getValue(parentSchema, ["properties", me]);
        schema.errorMessage = getMergedErrorMessage({dependencies: dependenciesKeyword(schema.title, deps[me].map(dep => getPropertyTitle(parentSchema, dep)))}, schema.errorMessage);
    }
}

/**
 * This message will mutate either the anyOfSchema or the parentSchema or both
 * @param {{}} anyOfSchema
 * @param {{}} parentSchema
 */
export function setAnyOfErrorMessages(anyOfSchema, parentSchema) {
    let anyOfFullSet = anyOfSchema.reduce((acc, schema) => {
        for(let keyword of Object.keys(schema)) {
            switch(keyword) {
                case 'required':
                    if(acc.has(keyword)) {
                        acc.get(keyword).push(schema.required);
                    } else {
                        acc.set(keyword, [schema.required]);
                    }
                    break;
                case 'type':
                    if(acc.has(keyword)) {
                        acc.get(keyword).push(schema.type);
                    } else {
                        acc.set(keyword, [schema.type]);
                    }
                    break;
            }
        }
        return acc;
    }, new Map());
    if(anyOfFullSet.size > 0) {
        for(let [keyword, data] of anyOfFullSet) {
            switch(keyword) {
                case "required":
                    _setAnyOfRequiredMessage(data, parentSchema);
                    break;
                case 'type':
                    parentSchema.errorMessage = getMergedErrorMessage({type: anyOfType(parentSchema.title, data)}, parentSchema.errorMessage);
                    break;
            }
        }
    }
}

/**
 * This function has a bunch of commented code because there are several ways to determine
 * where anyOf required messages should go and it may change in the future
 *
 * @param {[]} requiredFields
 * @param {{}} parentSchema
 * @private
 */
function _setAnyOfRequiredMessage(requiredFields, parentSchema){
    //Apply anyOf message to the parent object but tag them to individual fields
    const reqMessage = anyOfRequired(requiredFields.map(req => req.map(propName => getPropertyTitle(parentSchema, propName))));
    parentSchema.errorMessage = getMergedErrorMessage({
        required: requiredFields.reduce((acc, propName) => {
            acc[propName] = reqMessage;
            return acc;
        }, {})
    }, parentSchema.errorMessage);

    //Apply anyOf message to each anyOF element
    // for(let anyOfElement of anyOfSchema) {
    //     anyOfElement.errorMessage = getMergedErrorMessage({required: anyOfRequired(requiredFields)});
    // }

    //Apply anyOf message globally
    //set the message at the root level... but inject the field names ion the required
}

/**
 *
 * @param {{}} schema
 * @param {string} propName
 *
 * @returns {*}
 */
function getPropertyTitle(schema, propName) {
    const prop = getValue(schema, ['properties', propName]);
    return prop.title;
}

/**
 *
 * @param {{}} newErrorMessage
 * @param {{}} existingErrorMessage
 * @returns {{}}
 */
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