'use strict';
// https://github.com/ralusek/jsonschema-to-mobx-state-tree/blob/fe76a08ddfae67652d13f62c015b0d9ab4b7df58/index.js

import walkNodes from 'jsonschema-nodewalker';
import Lo from 'lodash';
import shortid from 'shortid';
import {types} from 'mobx-state-tree';
import {isPlainObject} from './types';

const titleCase = str => Lo.deburr(Lo.upperFirst(Lo.camelCase(str)));

function hasProp(obj,prop) {
    return Object.hasOwnProperty.call(obj,prop);
}

function getDefault(node) {
    if(!hasProp(node,'default')) return undefined;
    if(isPlainObject(node.default)) {
        const keys = Object.keys(node.default);
        if(keys.length === 1 && hasProp(defaultKeywords,keys[0])) {
            return defaultKeywords[keys[0]](node.default[keys[0]])
        }
    }
    return node.default;
}

const defaultKeywords = {
    $uuid(type) {
        switch(type) {
            case 'shortid':
                return () => shortid();
        }
        throw new Error(`$uuid type "${type}" not implemented`);
    }
}

const Integer = types.refinement('integer',types.number, i => Number.isInteger(i));

export default (types) => {
    const TYPE_MAP = Object.freeze({
        boolean: (node, meta) => types.boolean,
        number: (node, meta) => types.number,
        integer: (node, meta) => Integer,
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
        // TODO: see https://github.com/mobxjs/mobx-state-tree#references-and-identifiers
        // might be able to make 'shortid' an identifier
        if(hasDefault) {
            result = node.default === null 
                ? types.maybe(type) 
                : types.optional(type, getDefault(node));
        } else if(!isRequired) {
            result = types.maybe(type);
        }
        return onNode 
            ? onNode(result, {node, meta, typeMap: TYPE_MAP}) 
            : result;
    });
};