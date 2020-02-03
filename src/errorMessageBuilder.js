import {getValue, isObject, isString} from "./helpers";
import {
    requiredKeyword,
    typeKeyword,
    anyOfType,
    anyOfRequired,
    dependenciesKeyword,
    patternKeyword,
    minMaxLength,
    minMax,
    minMaxItems
} from "./errorDefinition.en";

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
    const depTitleMap = new Map();
    let flippedDependencies = mapFlippedDependencies(deps);
    for(let [level1DepName, level2DepSet] of flippedDependencies) {
        const level1Title = getSetDepTitle(level1DepName, depTitleMap, parentSchema);
        const schema = getValue(parentSchema, ["properties", level1DepName]);
        schema.errorMessage = getMergedErrorMessage({dependencies: dependenciesKeyword(level1Title, Array.from(level2DepSet).map(level2DepName => getSetDepTitle(level2DepName, depTitleMap, parentSchema)))}, schema.errorMessage);
    }
    // console.log(JSON.stringify(deps));
    // console.log(flippedDependencies);
}

/**
 * fun helper function for setDependenciesErrorMessage that flips dependencies for better error messages
 * @param {{}} dependencies
 * @returns {Map<any, any>}
 */
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
                    _setAnyOfRequiredMessage(data, parentSchema, anyOfSchema);
                    break;
                case 'type':
                    parentSchema.errorMessage = getMergedErrorMessage({type: anyOfType(parentSchema.title, data)}, parentSchema.errorMessage);
                    break;
            }
        }
    }
}

export function setObjectErrorMessages(schema) {
    if(schema.required && schema.required.length > 0) {
        setRequiredErrorMessage(schema);
    }
    if(schema.dependencies) {
        setDependenciesErrorMessage(schema.dependencies, schema);
    }
}

export function setStringErrorMessages(schema) {
    setPatternErrorMessage(schema);
    setStringLengthErrorMessage(schema);
}


/**
 * This function has a bunch of commented code because there are several ways to determine
 * where anyOf required messages should go and it may change in the future
 *
 * @param {[]} requiredFields
 * @param {{}} parentSchema
 * @param {{}} anyOfSchema
 * @private
 */
function _setAnyOfRequiredMessage(requiredFields, parentSchema, anyOfSchema) {
    const reqMessage = anyOfRequired(requiredFields.map(req => req.map(propName => getPropertyTitle(parentSchema, propName))));
    // for(let fieldGroup of requiredFields) {
    //     for(let propName of fieldGroup) {
    //         let fieldSchema = parentSchema.properties[propName];
    //         fieldSchema.errorMessage = getMergedErrorMessage({required: reqMessage}, fieldSchema.errorMessage);
    //     }
    // }

    //Apply anyOf message to the parent object but tag them to individual fields
    // parentSchema.errorMessage = getMergedErrorMessage({
    //     required: requiredFields.reduce((acc, propName) => {
    //         acc[propName] = reqMessage;
    //         return acc;
    //     }, {})
    // }, parentSchema.errorMessage);

    //Apply anyOf message to each anyOF element
    for(let anyOfElement of anyOfSchema) {
        anyOfElement.errorMessage = getMergedErrorMessage({required: reqMessage}, anyOfElement.errorMessage);
    }

    //Apply anyOf message globally
    //set the message at the root level... but inject the field names in the required
}

/**
 *
 * @param {{}} schema
 * @param {string} propName
 *
 * @returns {string}
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