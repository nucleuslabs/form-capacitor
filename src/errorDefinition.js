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

function convertType(type) {
    return TYPES.has(type) ? TYPES.get(type) : 'an unknown';
}

export function typeKeyword(title, type) {
    return `${title} must be ${convertType(type)}`;
}

export function requiredKeyword(title) {
    return `Please fill in the ${title} field`;
}

export function dependenciesKeyword(dependant, dependencies) {
    return `Please fill in the ${dependant} field. It is required when ${dependencies.length > 1 ? `either ${dependencies.join(' or ')}` : `${dependencies[0]}`} is set`;
}

export function patternKeyword(title) {
    return `${title} does not match the expected format`;
}

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
        const str = `${title} must be a ${min.toString()} or more but less than ${xMax.toString()}`;
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
        return {exclusiveMinimum: `${title} must more than ${xMin.toString()}`};
    } else if(xMax !== undefined) {
        return {exclusiveMaximum: `${title} must be less than ${xMax.toString()}`};
    } else {
        return {};
    }
}

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

export function allOfRequired(andFields) {
    return `Please fill out the ${andFields.join('and ')} fields`;
}

export function anyOfRequired(orFields) {
    if(orFields.length === 1) {
        return `Please fill in the ${orFields[0].length > 1 ? `(${orFields[0].join(' and ')})` : orFields[0]} field(s)`;
    } else {
        return `Please fill in either the ${orFields.map((andFields) => andFields.length > 1 ? `(${andFields.join(', ')})` : andFields[0]).join(' or ')} field(s)`;
    }
}

export function anyOfType(title, types) {
    return `${title} must either be ${types.map(type => {
        return convertType(type);
    }).join(' or ')}`;
}