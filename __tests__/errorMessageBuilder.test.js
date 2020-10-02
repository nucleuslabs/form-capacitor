import {setAllOfErrorMessages, setNumberRangeErrorMessage} from '../src/errorMessageBuilder';

const originalWarn = console.warn;
const warnSet = new Set();
const mockedWarn = function (message) {
    warnSet.add(message);
};

beforeEach(() => {
    warnSet.clear();
    console.warn = mockedWarn;
});

afterEach(() => {
    console.warn = originalWarn;
});

describe('setNumberRangeErrorMessage', function () {
    it('Incorrect values should make console warnings', function () {
        const title = 'test';
        setNumberRangeErrorMessage({
            title: title,
            minimum: 12,
            maximum: 10
        });
        expect(warnSet.has(`Warning the json schema titled ${title} has a minimum that is higher than the maximum`)).toBeTrue();
        setNumberRangeErrorMessage({
            title: title,
            minimum: 12,
            exclusiveMaximum: 10
        });
        expect(warnSet.has(`Warning the json schema titled ${title} has a minimum that is higher or equal to the exclusiveMaximum`)).toBeTrue();
        setNumberRangeErrorMessage({
            title: title,
            exclusiveMinimum: 12,
            maximum: 10
        });
        expect(warnSet.has(`Warning the json schema titled ${title} has a exclusiveMinimum that is higher than or equal to the maximum`)).toBeTrue();
        setNumberRangeErrorMessage({
            title: title,
            exclusiveMinimum: 10,
            exclusiveMaximum: 10
        });
        expect(warnSet.has(`Warning the json schema titled ${title} has a exclusiveMinimum that not compatible with the exclusiveMaximum. They are too close in value`)).toBeTrue();
    });
});


describe('setAllOfErrorMessages', function () {
    it('Incorrect values should make console warnings', function () {
        const parentSchema = {
            "title": "person",
            "allOf": [
                {
                    "type": "object",
                    "properties": {
                        "age": {
                            "title": "age",
                            "type": "number"}
                    },
                    "required": ["age"]
                },
                {
                    "type": "object",
                    "properties": {
                        "name": {
                            "title": "name",
                            "type": "string"}
                    },
                    "required": ["name"]
                },
                {
                    "type": "object",
                    "properties": {
                        "funny": {"type": "boolean"}
                    },
                }
            ]
        };
        const allOfSchema = parentSchema.allOf;
        setAllOfErrorMessages(allOfSchema, parentSchema);
        expect(parentSchema.errorMessage).toEqual({required: "Please fill out the age and name fields", type: "person must be an object"});
    });
});
