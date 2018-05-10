const EMPTY_OBJECT = Object.freeze(Object.create(null))
const EMPTY_ARRAY = Object.freeze([])

// function node(type, body) {
//     return {type, body, /*loc: location()*/};
// }
//
// function literal(value) {
//     return node('literal',value);
// }

function lastColumn(list) {
    return list.map(e => e[e.length-1]);
}

function list(head, tail) {
    return [head, ...lastColumn(tail)];
}



function Node(type, extra) {
    const {start,end} = location();
    return {
        type,
        ...extra,
        loc: {
            start: {
                line: start.line,
                column: start.column /*-1*/,
            },
            end: {
                line: end.line,
                column: end.column /*-1*/,
            },
        },
      
    }
}



const Expression = Node;

const Literal = Node.bind(null,'Literal');
const Schema = Node.bind(null,'Schema');

function RegExpLiteral(pattern,flags) {
    return Node('RegExpLiteral',{pattern,flags})
}

function NullLiteral() {
    return Node('NullLiteral')
}

function BooleanLiteral(value) {
    return Node('BooleanLiteral',{value})
}

function NumericLiteral(value) {
    return Node('NumericLiteral',{value})
}

function StringLiteral(value) {
    return Node('StringLiteral',{value})
}

function Identifier(name) {
    return Node('Identifier',{name})
}