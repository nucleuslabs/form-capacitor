const _ = require('lodash');
const classNames = require('classnames');
const { defaultMemoize, createSelectorCreator } = require('reselect');

/**
 * Unflatten an object. e.g.,
 *
 *      > unflatten({
 *          "foo.bar": "baz"
 *      })
 *      {
 *          foo: {
 *              bar: "baz"
 *          }
 *      }
 *
 * @param {Object} object Flat object
 * @returns {Object} Unflattened object
 */
exports.unflatten = function unflatten(object) {
    let result = {};
    for(let key of Object.keys(object)) {
        _.set(result, key, object[key]);
    }
    return result;
};

const _glob = (object, path, defaultValue) => {
    let [first, ...rest] = path;
    let value = object[first];
    if(value === undefined) {
        value = object['*'];
        if(value === undefined) {
            // TODO: support **
            return defaultValue;
        }
    }
    if(rest.length) {
        return _glob(value, rest, defaultValue);
    }
    return value;
};


/**
 * Gets the value at `path` of `object`. If the resolved value is `undefined`, look for a `*` key. If that too is `undefined`, the `defaultValue` is returned in its place.
 *
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} defaultValue The value returned for `undefined` resolved values.
 * @return {*} Returns the resolved value.
 * @see https://lodash.com/docs/4.17.4#get
 */
exports.glob = function glob(object, path, defaultValue) {
    if(!object) {
        console.warn('glob object is falsey');
        return defaultValue;
    }
    return _glob(object, _.toPath(path), defaultValue);
};

exports.mergeAttrs = function mergeAttrs(merged, ...attrDicts) {
    let eventHandlers = {};

    for(let attrs of attrDicts) {
        _.each(attrs, (value, attr) => {
            if(value === undefined) {
                //
            } else if(merged[attr] === undefined) {
                merged[attr] = value;
            } else if(attr === 'style') {
                Object.assign(merged[attr], value);
            } else if(attr === 'className') {
                merged[attr] = classNames(merged[attr], value);
            } else if(attr === 'ref' || /^on[A-Z]/.test(attr)) {
                (eventHandlers[attr] || (eventHandlers[attr] = [])).push(value);
            } else {
                merged[attr] = value;
            }
        });
    }

    _.each(eventHandlers, (funcs, attr) => {
        if(merged[attr]) {
            funcs.unshift(merged[attr]);
        }
        if(funcs.length === 1) {
            merged[attr] = funcs[0];
        } else {
            merged[attr] = (...args) => {
                let result = undefined;
                for(let func of funcs) {
                    result = func(...args, result);
                }
                return result;
            };
        }
    });

    return merged;
};

/**
 * Returns true if a value is null, undefined, or NaN.
 *
 * @param {*} value Value to check
 * @returns {boolean} True if a value is null, undefined, or NaN.
 * @see https://github.com/graphql/graphql-js/blob/39744381d5173795d3b245dcb5d86e78bb3638fe/src/jsutils/isNullish.js#L11-L16
 */
exports.isNullish = function isNullish(value) {
    // eslint-disable-next-line no-self-compare
    return value === null || value === undefined || value !== value;
};

exports.array = function array(x) {
    if(!x) return [];
    return Array.isArray(x) ? [...x] : [x];
};

exports.createDeepEqualSelector = createSelectorCreator(
    defaultMemoize,
    _.isEqual
);

exports.pick = function pick(src, props, dest={}) {
    return Object.keys(props).reduce((dest,p) => {
        if(typeof props[p] === 'string') {
            dest[props[p]] = src[p];
        } else if(props[p]) {
            dest[p] = src[p];
        }
        return dest;
    },dest);
};

exports.arrayCompare = function arrayCompare(arr1, arr2) {
    return arr1.length === arr2.length && arr1.every((v,i) => Object.is(v,arr2[i]));
};


exports.isEmpty = function isEmpty(value) {
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
