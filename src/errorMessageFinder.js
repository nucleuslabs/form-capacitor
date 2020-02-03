import {isString} from "./helpers";

const keywordFunctions = new Map(
    [
        ['required', findRequiredMessage],
        ['dependencies', findDependenciesMessage]
    ]
);

export function replaceErrorMessage(error, errors){
    return Object.assign({}, error, {message: findErrorMessage(error,errors)});
}

export function findErrorMessage(error, errors){
    if(keywordFunctions.has(error.keyword)){
        return keywordFunctions.get(error.keyword)(error, errors);
    } else {
        return getClosestErrorMessage(error.parentSchema, error.keyword, error.params.property) || error.message;
    }
}

function findRequiredMessage(error, errors) {
    const matches = error.schemaPath.match(/^(.+\/anyOf|allOf|oneOf)\/\d+\/required$/);
    const propName = error.params.missingProperty;
    if(matches && matches.length > 1) {
        const rootErrorPath = matches[1];
        const rootErr = errors.find(err => err.schemaPath === rootErrorPath);
        return getClosestErrorMessage(error.parentSchema, 'required', propName) || getClosestErrorMessage(rootErr.parentSchema, 'required', propName) || error.message;
    } else {
        return getClosestErrorMessage(error.parentSchema, 'required', propName) || error.message;
    }
}

function findDependenciesMessage(error) {
    const propName = error.params.missingProperty;
    return getClosestErrorMessage(error.parentSchema, 'dependencies', propName) || getClosestErrorMessage(error.schema, 'dependencies', propName) || error.message;
}

function getClosestErrorMessage(schema, keyword, propName, skipLocalCheck = false) {
    if(schema.properties && schema.properties[propName] && !skipLocalCheck) {
        const message = getClosestErrorMessage(schema.properties[propName], keyword, propName, true);
        if(message) {
            return message;
        }
    }
    if(schema.errorMessage) {
        const errorMessage = schema.errorMessage;
        if(isString(errorMessage)) {
            return errorMessage;
        } else if(errorMessage[keyword]) {
            const deepErrorMessage = schema.errorMessage[keyword];
            if(isString(deepErrorMessage)) {
                return deepErrorMessage;
            } else if(propName && isString(deepErrorMessage[propName])) {
                return deepErrorMessage[propName];
            }
        }
    }
    return null;
}
