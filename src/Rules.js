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
    let fn = optional((value, ...ruleArgs) => ruleFn(defaultMessageFn(value, ...additionalMessageArgs))(value, ...ruleArgs));
    fn.message = msgFn => optional((value, ...ruleArgs) => ruleFn(msgFn(value, ...additionalMessageArgs))(value, ...ruleArgs));
    return fn;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function required(value) {
    return isFilled(value) ? OK : 'This field is required.';
}

function optional(rule) {
    return (value, ...args) => isEmpty(value) ? OK : rule(value, ...args);
}

function minLength(length) {
    return withMessage(
        value => `Please enter at least ${length} characters (${length - value.length} more).`,
        msg => value => value.length < length ? msg : OK,
        [length]
    );
}

function maxLength(length) {
    return withMessage(
        value => `Please enter at most ${length} characters. You've entered ${value.length}.`,
        msg => value => value.length > length ? msg : OK,
        [length]
    );
}

const email = withMessage(
    () => `Please enter a valid email address.`,
    msg => value => /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(value) ? OK : msg,
    [length]
);

// TODO: add rest from https://jqueryvalidation.org/documentation/#link-list-of-built-in-validation-methods

module.exports = {required, optional, minLength, maxLength, email};
