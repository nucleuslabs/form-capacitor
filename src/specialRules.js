const isDependant = Symbol('isDependant');
const isAsync = Symbol('isAsync');
const util = require('./util');
const lodash = require('lodash');

/**
 * @param {Function} rule
 * @param {Array.<string>} fields
 */
function dependantRule(fields, rule) {
    if(!Array.isArray(fields)) throw new Error("`fields` must be an array");
    if(!lodash.isFunction(rule)) throw new Error("`rule` must be a function");
    return {
        rule,
        fields: util.array(fields),
        [isDependant]: true,
    };
}

function asyncRule(rule, pendingMessage) {
    if(!lodash.isFunction(rule)) throw new Error("`rule` must be a function");
    
    return {
        rule,
        message: pendingMessage,
        [isAsync]: true,
    }
}


module.exports = {dependantRule, asyncRule, isDependant, isAsync};

// FIXME: rule object should look something like

let rule = {
    isAsync: true,
    pendingMessage: "Checking...",
    errorMessage: "Password is too weak", // {string|Function} message to display if input is not valid
    isValid: (pw,confirm) => pw === confirm,
    precondition: (value,ui) => value.length > 6, // {Function} if precondition fails, validation rule is not ran (not cached)
    dependsOn: ['password'], 
    isOptional: true, // don't run validation rule if _.isEqual(value,defaultValue)
};