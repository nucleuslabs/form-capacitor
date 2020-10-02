import { strictSanitizer } from '../src';

//tests requiring mobx state tree
describe('filterNullsFromTree', function() {
    it('Should ', async function() {
        const testPojo = {
            firstName: "Freddy",
            lastName: "Two Toes",
            e: "",
            f: false,
            n: null,
            u: undefined,
            deep: {
                e: '',
                n: null,
                f: false,
                u: undefined,
                eObj: {}
            },
            eObj: {},
            shouldBeEmptyObj: {
                n: null,
                u: undefined
            },
            caray: [
                {n: null, f: false},
                undefined,
                null,
                "beef"
            ]
        };
        const sanitized = strictSanitizer(testPojo);
        expect(sanitized).not.toEqual(testPojo);
        expect(sanitized.n).toBeNull();
        expect(sanitized.u).toBeUndefined();
        expect(sanitized.e).toEqual("");
        expect(sanitized.f).toEqual(false);
        expect(sanitized.deep.e).toEqual("");
        expect(sanitized.deep.n).toBeNull();
        expect(sanitized.deep.u).toBeUndefined();
        expect(sanitized.deep.f).toEqual(false);
        expect(sanitized.deep.eObj).toBeUndefined();
        expect(sanitized.eObj).toBeUndefined();
        expect(sanitized.shouldBeEmptyObj).toEqual({n: null});
        expect(sanitized.caray.length).toEqual(3);
        expect(sanitized.caray[0]).toEqual({n: null, f: false});
        expect(sanitized.caray[1]).toBeNull();
        expect(sanitized.caray[2]).toEqual("beef");
    });
});