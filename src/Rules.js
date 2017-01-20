const _ = require('lodash');
// const {Seq} = require('immutable');
// import {hasProp} from '../../functions';

const OK = true;

function isEmpty(value) {
    if(_.isString(value) || _.isArray(value)) {
        return !value.length;
    }
    if(value instanceof Map || value instanceof Set) {
        return !value.size;
    }
    if(_.isPlainObject(value)) {
        return !_.size(value);
    }
    return !value;
}

function isFilled(value) {
    return !isEmpty(value);
}

function withMessage(defaultMessageFn, ruleFn, additionalMessageArgs) {
    let fn = (value, ...ruleArgs) => ruleFn(defaultMessageFn(value, ...additionalMessageArgs))(value, ...ruleArgs);
    fn.message = msgFn => (value, ...ruleArgs) => ruleFn(msgFn(value, ...additionalMessageArgs))(value, ...ruleArgs);
    return fn;
}

function wrap(defaultMessageFunc, ruleFunc, additionalMessageArgs=[]) {
    return withMessage(defaultMessageFunc, optional(ruleFunc), additionalMessageArgs);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function required(value) {
    return isFilled(value) ? OK : 'This field is required.';
}

function optional(rule) {
    return (value, ...args) => isEmpty(value) ? OK : rule(value, ...args);
}

function minLength(length) {
    return wrap(
        () => `Please enter at least ${length} characters.`,
        msg => value => value.length < length ? msg : OK,
        [length]
    );
}

function maxLength(length) {
    return wrap(
        value => `Please enter at most ${length} characters. You've entered ${value.length}.`,
        msg => value => value.length > length ? msg : OK,
        [length]
    );
}

// TODO: add rest from https://jqueryvalidation.org/documentation/#link-list-of-built-in-validation-methods

module.exports = {required, optional, minLength, maxLength};
