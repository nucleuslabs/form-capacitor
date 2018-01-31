import * as fnMap from './ast2ajv';

export default function(ast) {
    let context = {
        schemas: {},
    }
    ast.forEach(node => parse(node, context));
    return context;
}

function parse(node, context) {
    if(!node || !node.type) {
        console.error('Falsey node',{node,context});
        throw new Error(`Falsey node`);
    }


    try {
        return parseAs(node.type, node.body, context);
    } catch(err) {
        if(!err.location) {
            err.location = node.loc;
        }
        throw err;
    }
}

function parseAs(type, body, context) {
    if(!fnMap[type]) {
        console.error(`Unhandled node type: ${type}, body:`, body);
        return '❓';
    }
    
    return fnMap[type](body, context);
}

export function schemaDefinition(def) {
    let schema = Object.create(null);

    if(def.title) {
        schema.title = parse(def.title);
    }
    if(def.description) {
        schema.description = parse(def.description);
    }
    if(def.default) {
        schema.default = parse(def.default);
    }

    // let {base,ext} = def.type;
    let type = parse(def.type.base);
    if(def.type.ext) {
        Object.assign(type, parse(def.type.ext));
    }
    // console.log('type',type);
    Object.assign(schema,type);
    
    return schema;
}

export function type(def) {
    //
    // // let {base,ext} = def.type;
    let type = parse(def.base);
    if(def.ext) {
        Object.assign(type, parse(def.ext));
    }

    return type;
}

export function schema(body, context) {
    let name = body.name || 'default';
    let schema = context.schemas[name] = parse(body.definition);
    
    
    
    // let def = body.definition || {};

    // console.log('base',base,'ext',ext);
    // Object.assign(def, parse(def.type));
    // console.log('schema',body);
}

export function objectLiteral(body, context) {
    let out = Object.create(null);
    for(let k of Object.keys(body)) {
        out[k] = parse(body[k]);
    }
    return out;
}

export function literal(body, context) {
    return body;
}

function obj() {
    return Object.create(null);
}

export function basicType(type) {
    switch(type) {
        case 'Array':
            return {type: 'array'}
        case 'Number':
            return {type: 'number'}
    }
    throw new Error(`Unknown basic type: ${type}`);
}

export function objectSchema(body, context) {
    let schema = {
        type: 'object',
        additionalProperties: false,
        required: body.required,
    };
    // console.log('OBJECT',body);
    if(body.properties) {
        let keys = Object.keys(body.properties);
        schema.properties = obj();
        for(let k of keys) {
            schema.properties[k] = parse(body.properties[k]);
        }
    }


    return schema
}

export function typeExt(body, context) {
    
    let ext = Object.create(null);
    for(let key of Object.keys(body)) {
        // console.log('KEEEYY',key,body[key]);
        Object.assign(ext, parseAs(key,body[key]));
    }
    
    return ext;
    // console.log('typeExt',{body,context})
    
    // return {foo:'bar'}
}

export function Array_minLength(body) {
    return {minlength: parse(body)}
}

export function Array_items(body) {
    return {items: parse(body)}
}

// export function type(body, context) {
//    
//     return {FOOOO:"BAAARR"}
// }