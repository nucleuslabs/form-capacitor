'use strict';
// https://github.com/ralusek/jsonschema-to-mobx-state-tree/blob/fe76a08ddfae67652d13f62c015b0d9ab4b7df58/index.js

import walkNodes from 'jsonschema-nodewalker';
import Lo from 'lodash';

const titleCase = str => Lo.deburr(Lo.upperFirst(Lo.camelCase(str)));

export default (types) => {
    const TYPE_MAP = Object.freeze({
        boolean: (node, meta) => types.boolean,
        number: (node, meta) => types.number,
        string: (node, meta) => {
            const format = node.format;
            if(format === 'datetime') return types.Date;
            return types.string;
        },
        object: (node, meta) => {
            return Object.keys(meta.childObjectProperties).length ?
                node.title ?
                    types.model(titleCase(node.title), meta.childObjectProperties) :
                    types.model(meta.childObjectProperties) :
                types.frozen;
        },
        array: (node, meta) => types.array(meta.childArrayItem)
    });

    return (schema = {}, onNode) => walkNodes(schema, (node, meta) => {
        const type = TYPE_MAP[node.type](node, meta);
        const hasDefault = node.default !== undefined;
        const isRequired = meta.isRequired || !meta.lineage;
        let result = type;
        if(hasDefault) {
            result = node.default === null 
                ? types.maybe(type) 
                : types.optional(type, node.default);
        } else if(!isRequired) {
            result = types.maybe(type);
        }
        return onNode 
            ? onNode(result, {node, meta, typeMap: TYPE_MAP}) 
            : result;
    });
};