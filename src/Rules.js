const _ = require('lodash');
const util = require('./util');


function isFilled(value) {
    return !util.isEmpty(value);
}

function custom(validateFn, options) {
    return {
        isAsync: false, // validate is expected to return a Promise. Validation rule will not run if other synchronous validation rules are failing
        message: "This field is invalid.", // {string|Function} message to display if input is not valid
        validate: validateFn,
        precondition: () => true, // {Function} if precondition fails, validation rule is not ran (not cached). Probably not needed if sync functions run first.
        dependsOn: [],
        isOptional: true, // don't run validation rule if _.isEqual(value,defaultValue)
        type: 'error', // "error" or "warning"
        compare: util.arrayCompare, // checks if the input args the same as last time and if so, returns the cached/memoized error message
        ...options,
    }
}

function async(validateFn, options) {
    return custom(validateFn, {isAsync: true, ...options});
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const required = custom(isFilled, {
    message: 'This field is required.',
    isOptional: false,
});

function minLength(length,message=(value,length) => `Please enter at least ${length} characters (${length - value.length} more).`) {
    return custom(val => val.length >= length, {message: value => message(value,length)});
}

function maxLength(length,message=(value,length) => `Please enter at most ${length} characters. You've entered ${value.length}.`) {
    return custom(val => val.length <= length, {message: value => message(value,length)});
}

const email = custom(value => /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(value), {
    message: `Please enter a valid email address.`,
});



// TODO: add rest from https://jqueryvalidation.org/documentation/#link-list-of-built-in-validation-methods

module.exports = {required, minLength, maxLength, email, custom, async};
