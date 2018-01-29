export function schema(node, context) {
    let name = node.name || 'default';
    let schema = context.schemas[name] = {};
    console.log('schhheema',node);
}