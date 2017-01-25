const isDependantRule = Symbol('isDependantRule');
const util = require('./util');

/**
 * @param {Function} rule
 * @param {Array.<string>} fields
 * @param {Object} options
 * @param {Number=0} options.debounce Number of ms to debounce by
 * @param {Boolean|Function=false} options.memoize `true` to memoize using default serializer, or a function that returns the memoization key
 */
exports.dependantRule = function dependantRule(fields=[], rule, options={}) {
    if(!rule) {
        throw new Error("`rule` must be a function in call to `dependantRule`");
    }
    return {
        rule,
        fields: util.array(fields),
        options: options || {},
        [isDependantRule]: true,
    };
};


exports.isDependantRule = isDependantRule;