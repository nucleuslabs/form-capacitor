/**
 * This file contains all of the default english error definitions for FC2
 **/

const TYPES = new Map(
    [
        ["integer", "a whole number"],
        ["number", "a number"],
        ["string", "a string"],
        ["object", "an object"],
        ["array", "an array"],
        ["null", "empty"],
        ["undefined", "empty"],
        ["function", "function"]
    ]
);


/**
 *
 * @param {string} type
 * @returns {string}
 */
/* istanbul ignore next */
function convertType(type) {
    return TYPES.has(type) ? TYPES.get(type) : 'an unknown';
}

/**
 * @param {string} title
 * @param {string} type
 * @returns {string}
 */
export function typeKeyword(title, type) {
    return `${title} must be ${convertType(type)}`;
}

/**
 * @param {string} title
 * @returns {string}
 */
export function requiredKeyword(title) {
    return `Please fill in the ${title} field`;
}

/**
 * @param {string} dependant
 * @param {string[]} dependencies
 * @returns {string}
 */
export function dependenciesKeyword(dependant, dependencies) {
    return `Please fill in the ${dependant} field. It is required when ${dependencies.length > 1 ? `either ${dependencies.join(' or ')}` : `${dependencies[0]}`} is set`;
}

/**
 * @param {string} title
 * @returns {string}
 */
export function patternKeyword(title) {
    return `${title} does not match the expected format`;
}

/**
 * @param {string} title
 * @param {number} min
 * @param {number} max
 * @param {number} xMin
 * @param {number} xMax
 * @returns {{maximum: string, exclusiveMinimum: string}|{exclusiveMaximum: string, exclusiveMinimum: string}|{exclusiveMaximum: string}|{}|{minimum: string}|{maximum: string, minimum: string}|{exclusiveMaximum: string, minimum: string}|{maximum: string}|{exclusiveMinimum: string}}
 */
export function minMax(title, min, max, xMin, xMax) {
    if(min !== undefined && max !== undefined) {
        if(min === max) {
            const str = `${title} must be ${min.toString()}`;
            return {minimum: str, maximum: str};
        } else {
            const str = `${title} must be a number from ${min.toString()} to ${max.toString()}`;
            return {minimum: str, maximum: str};
        }
    } else if(min !== undefined && xMax !== undefined) {
        const str = `${title} must be ${min.toString()} or more but less than ${xMax.toString()}`;
        return {minimum: str, exclusiveMaximum: str};
    } else if(xMin !== undefined && max !== undefined) {
        const str = `${title} must be greater than ${xMin.toString()} to a maximum of ${max.toString()}`;
        return {exclusiveMinimum: str, maximum: str};
    } else if(xMin !== undefined && xMax !== undefined) {
        const str = `${title} must be between ${xMin.toString()} and ${xMax.toString()}`;
        return {exclusiveMinimum: str, exclusiveMaximum: str};
    } else if(min !== undefined) {
        return {minimum: `${title} must be ${min.toString()} or more`};
    } else if(max !== undefined) {
        return {maximum: `${title} must be ${max.toString()} or less`};
    } else if(xMin !== undefined) {
        return {exclusiveMinimum: `${title} must be more than ${xMin.toString()}`};
    } else if(xMax !== undefined) {
        return {exclusiveMaximum: `${title} must be less than ${xMax.toString()}`};
    } else {
        /* istanbul ignore next */
        return {};
    }
}

/**
 * @param {string} title
 * @param {number} min
 * @param {number} max
 * @returns {{minItems: string}|{minItems: string, maxItems: string}|{maxItems: string}|{}}
 */
export function minMaxItems(title, min, max) {
    if(min !== undefined && max !== undefined) {
        if(min === max) {
            const str = `Must have ${min.toString()} ${title}`;
            return {minItems: str, maxItems: str};
        } else {
            const str = `Must have from ${min.toString()} to ${max.toString()} ${title}`;
            return {minItems: str, maxItems: str};
        }
    } else if(min !== undefined) {
        return {minItems: `Must have at least ${min.toString()} ${title}`};
    } else if(max !== undefined) {
        return {maxItems: `Must have ${max.toString()} or less ${title}`};
    } else {
        return {};
    }
}

/**
 * @param {string} title
 * @param {number} min
 * @param {number} max
 * @returns {{minLength: string, maxLength: string}|{maxLength: string}|{minLength: string}|{}}
 */
export function minMaxLength(title, min, max) {
    if(min !== undefined && max !== undefined) {
        if(min === max) {
            const str = `${title} must have ${min.toString()} characters`;
            return {minLength: str, maxLength: str};
        } else {
            const str = `${title} must have from ${min.toString()} to ${max.toString()} characters`;
            return {minLength: str, maxLength: str};
        }
    } else if(min !== undefined) {
        return {minLength: `${title} must have at least ${min.toString()} characters`};
    } else if(max !== undefined) {
        return {maxLength: `${title} must not have more than ${max.toString()} characters`};
    } else {
        return {};
    }
}

/**
 * @param {string[]} andFields
 * @returns {string}
 */
export function allOfRequired(andFields) {
    return `Please fill out the ${andFields.join(' and ')} fields`;
}

/**
 * @param {string[]} orFields
 * @returns {string}
 */
export function anyOfRequired(orFields) {
    if(orFields.length === 1) {
        return `Please fill in the ${orFields[0].length > 1 ? `(${orFields[0].join(' and ')})` : orFields[0]} field(s)`;
    } else {
        return `Please fill in either the ${orFields.map((andFields) => andFields.length > 1 ? `(${andFields.join(', ')})` : andFields[0]).join(' or ')} field(s)`;
    }
}

/**
 * @param {string} title
 * @param {string[]} types
 * @returns {string}
 */
export function anyOfType(title, types) {
    return `${title} must either be ${types.map(type => {
        return convertType(type);
    }).join(' or ')}`;
}