import {minMax, minMaxLength, minMaxItems, anyOfRequired} from '../src/errorDefinition';


describe('minMax Edge Case', function () {
    it('Should handle undefined edge case for minMaxLength', function () {
        const str = `hello must be less than 22`;
        expect(minMax("hello",undefined,undefined,undefined,22)).toEqual({exclusiveMaximum: str});
        expect(minMax("hello")).toEqual({});
    });
});

describe('minMaxLength Edge Case', function () {
    it('Should handle undefined edge case for minMaxLength', function () {
        const str = `hello must have 12 characters`;
        expect(minMaxLength("hello")).toEqual({});
        expect(minMaxLength("hello", 12, 12)).toEqual({minLength: str, maxLength: str});
    });
});

describe('minMaxItems Edge Cases', function () {
    it('Should handle undefined edge case for minItems', function () {
        const str = `Must have 12 hellos`;
        expect(minMaxItems("hellos", 12)).toEqual({minItems: "Must have at least 12 hellos"});
        expect(minMaxItems("hellos", 12, 12)).toEqual({minItems: str, maxItems: str});
        expect(minMaxItems("hellos")).toEqual({});
    });
});

describe('anyOfRequired Edge Cases', function () {
    it('Should handle undefined edge case for minItems', function () {
        expect(anyOfRequired([["cheese"]])).toEqual("Please fill in the cheese field(s)");
        expect(anyOfRequired([["cheese", "crackers"]])).toEqual("Please fill in the cheese, crackers field(s)");
        expect(anyOfRequired([["cheese", "crackers"],["oysters"]])).toEqual("Please fill in either the cheese, crackers or oysters field(s)");
    });
});
