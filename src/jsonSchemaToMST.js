'use strict';
// https://github.com/ralusek/jsonschema-to-mobx-state-tree/blob/fe76a08ddfae67652d13f62c015b0d9ab4b7df58/index.js

import {deburr, upperFirst, camelCase} from 'lodash';
import {types} from 'mobx-state-tree';
import {isPlainObject, isArrayLike} from './helpers';
import MstTypeError from "./errorTypes/MstTypeError";

/* istanbul ignore next */
const titleCase = str => deburr(upperFirst(camelCase(str)));
/* istanbul ignore next */
const UNDEFINED = 1 << 16;
/* istanbul ignore next */
// const OPTIONAL = 1 << 9;
/* istanbul ignore next */
const NULL = 1 << 15;
/* istanbul ignore next */
const UNION = 1 << 14; // https://github.com/mobxjs/mobx-state-tree/blob/878d7f312d03276304d20af9dc055837666dbc6f/packages/mobx-state-tree/src/core/type/type.ts#L36
/* istanbul ignore next */
// const OPTIONAL_UNION = OPTIONAL|UNION;

/* istanbul ignore next */
function hasProp(obj, prop) {
    return Object.hasOwnProperty.call(obj, prop);
}

/* istanbul ignore next */
function getDefault(node) {
    if(!hasProp(node, 'default')) return undefined;
    return node.default;
}

/* istanbul ignore next */
const TYPE_MAP = Object.freeze({
    //type: (node, meta) => types.type,
    boolean: () => types.boolean,
    number: () => types.number,
    integer: () => types.refinement('integer', types.number, i => Number.isInteger(i)),
    string: (node) => {
        const format = node.format;
        if(format === 'datetime') return types.Date;
        return types.string;
    },
    object: (node) => {
        const properties = Object.entries(node.properties).reduce((acc, [k, v]) => {
            acc[k] = makeType(v, {
                parent: node,
                // depth: meta.depth+1,
                key: k,
            });
            return acc;
        }, Object.create(null));

        // console.log('properties',properties);

        return node.title
            ? types.model(titleCase(node.title), properties)
            : types.model(properties);
    },
    array: (node) => {
        if(isPlainObject(node.items)) {
            return types.array(makeType(node.items, {
                parent: node,
                // depth: meta.depth+1,
            }));
        } else if(isArrayLike(node.items)) {
            if(node.items.length > 0) {
                const typesArr = node.items.map(item => makeType(item, {
                    parent: node.items,
                    // depth: meta.depth+1,
                }));
                //currently MST doesn't fully support what we are trying to achieve with
                // json schema which is defining type for each individual element specifically ...
                // so we are gonna allow all defined types in the node.items array...
                // and why not throw in undefined for fun... as we do else where in this function
                return types.array(types.union(...typesArr, types.undefined));
            } else {
                return types.array(types.undefined);
            }
        }
        throw new Error('array.items must be an object or array');
    },
    null: () => types.null,
});

// https://github.com/mobxjs/mobx-state-tree#types-overview
/* istanbul ignore next */
function makeType(node, meta) {
    const typeArr = [];
    if(node.type) {
        try {
            typeArr.push(TYPE_MAP[node.type](node, meta));
        } catch(err) {
            throw new MstTypeError(err.message, err, node.type, node);
        }
    }

    if(node.anyOf) {
        const anyOfTypes = node.anyOf.filter(x => x.type !== undefined).map(x => makeType(x, {
            parent: node,
        }));
        if(anyOfTypes.length > 0) {
            typeArr.push(types.union(...anyOfTypes));
        }
    }
    if(node.allOf) {
        const allOfTypes = node.allOf.filter(x => x.type !== undefined).map(x => makeType(x, {
            parent: node,
        }));
        if(allOfTypes) {
            typeArr.push(types.union(...allOfTypes));
        }
    }
    if(node.oneOf) {
        throw new Error(`JsonSchema "oneOf" is presently not supported`); // I guess it would be identical to node.anyOf for the purposes of MST no?
    }

    if(typeArr.length) {
        try {
            let type = types.length > 1 ? types.compose(...typeArr) : typeArr[0];
            if(node.default !== undefined) {
                if(node.default === null) {
                    if(hasUnionFlag(type, NULL)) {
                        return types.optional(type, null);
                    }
                    return types.maybe(type);
                }
                return types.optional(type, getDefault(node));
            }
            if(meta.parent && meta.key !== undefined) {
                if(hasUnionFlag(type, UNDEFINED)) {
                    return types.optional(type, undefined);
                }
                //Added null in here due to challenges with MST undefined and to allow json schema to validate
                return types.optional(types.union(type, types.undefined), undefined);
            }
            return type;
        } catch(err) {
            throw new MstTypeError(err.message, err, "union", node);
        }
    }
    throw new Error(`Could not make type; missing one of "type", "anyOf" or "allOf"`);
}

/* istanbul ignore next */
function hasUnionFlag(type, flag) {
    return (type.flags & flag) === flag
        || (
            (type.flags & UNION) === UNION
            && type._types.some(t => (t.flags & flag) === flag)
        );
}

export default schema => makeType(schema, {parent: null, depth: 0});