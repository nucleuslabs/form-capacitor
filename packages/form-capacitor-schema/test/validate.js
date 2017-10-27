import SchemaFactory from '../src/SchemaFactory';
import dump from '../dump';

const factory = new SchemaFactory({
    coerce: true,
});

let schema = factory.create({
    $id: 'schemaid',
    type: 'object',
    properties: {
        firstName: {
            type: 'string',
        },
        lastName: {
            type: 'string',
            required: true,
        },
        age: {
            type: 'integer',
            minimum: 0,
        }
    },
    minProperties: 1,
    maxProperties: 3,
});

dump(schema.validate({
    firstName: "Mark",
    age: 'qqq',
}));
