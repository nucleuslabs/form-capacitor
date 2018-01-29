import * as fnMap from './nodes';

export default function(ast) {
    let context = {
        schemas: {},
    }
    ast.forEach(node => parse(node, context));
    return context;
}

function parse(node, context) {
    if(!node || !node.type) {
        throw new Error(`Falsey node`);
    }
    if(!fnMap[node.type]) {
        console.log(`Unhandled node type: ${node.type}, body:`, node.body);
        return '❓';
    }

    try {
        return fnMap[node.type](node.body, context);
    } catch(err) {
        if(!err.location) {
            err.location = node.loc;
        }
        throw err;
    }
}