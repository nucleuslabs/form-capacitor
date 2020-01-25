'use strict';
// https://github.com/ralusek/jsonschema-to-mobx-state-tree/blob/fe76a08ddfae67652d13f62c015b0d9ab4b7df58/index.js

import Lo from 'lodash';
import {types} from 'mobx-state-tree';
import {isPlainObject, isArray} from './helpers';
import MstTypeError from "./MstTypeError";

/* istanbul ignore next */
const titleCase = str => Lo.deburr(Lo.upperFirst(Lo.camelCase(str)));
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
    // if(isPlainObject(node.default)) {
    //     const keys = Object.keys(node.default);
    //     if(keys.length === 1 && hasProp(defaultKeywords,keys[0])) {
    //         return defaultKeywords[keys[0]](node.default[keys[0]])
    //     }
    // }
    return node.default;
}

// /* istanbul ignore next */
// const defaultKeywords = {
//     // should we have resolved all these defaults into functions during the schema resolution phase..?
//     $uuid(type) {
//         switch(type) {
//             case 'shortid':
//                 return shortid;
//         }
//         throw new Error(`$uuid type "${type}" not implemented`);
//     }
// };

/* istanbul ignore next */
const TYPE_MAP = Object.freeze({
    boolean: (node, meta) => types.boolean,
    number: (node, meta) => types.number,
    integer: (node, meta) => types.refinement('integer', types.number, i => Number.isInteger(i)),
    string: (node, meta) => {
        const format = node.format;
        if(format === 'datetime') return types.Date;
        return types.string;
    },
    object: (node, meta) => {
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
    array: (node, meta) => {
        if(isPlainObject(node.items)) {
            return types.array(makeType(node.items, {
                parent: node,
                // depth: meta.depth+1,
            }));
        } else if(isArray(node.items)) {
            throw new Error('not implemented');
        }
        throw new Error('array.items must be an object or array');
    },
    null: (node, meta) => types.null,
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
        const anyOftypes = node.anyOf.filter(x => x.type !== undefined).map(x => makeType(x, {
            parent: node,
        }));
        if(anyOftypes.length > 0) {
            typeArr.push(types.union(...anyOftypes));
        }
    }
    if(node.allOf) {
        typeArr.push(types.compose(...node.allOf.map(x => makeType(x, {
            parent: node
        }))));
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

// TODO: scrap walkNodes, roll own
// const foo = (schema = {}, onNode) => walkNodes(schema, (node, meta) => {
//     const type = makeType(node,meta);
//     const hasDefault = node.default !== undefined;
//     const isRequired = meta.isRequired || !meta.lineage; // lineage is for root element
//     let result = type;
//     // TODO: see https://github.com/mobxjs/mobx-state-tree#references-and-identifiers
//     // might be able to make 'shortid' an identifier
//     console.log(type.name,{type,hasDefault,isRequired});
//     if(hasDefault) {
//         // console.log(type,(type.flags & UNION)===UNION);
//         let includesNull = (type.flags & UNION)===UNION && type.types.some(t => (t.flags & NULL) === NULL);
//
//
//         result = node.default === null
//             ? (includesNull ? type : types.maybe(type))
//             : types.optional(type, getDefault(node));
//     } else if(!isRequired) {
//         result = types.maybe(type);
//     }
//     // console.log('result',result);
//     return onNode
//         ? onNode(result, {node, meta})
//         : result;
// });


export default schema => makeType(schema, {parent: null, depth: 0});