import { builtInDefaultSanitizer } from '../src';

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
        const sanitized = builtInDefaultSanitizer(testPojo);
        expect(sanitized).not.toEqual(testPojo);
        expect(sanitized.n).toBeUndefined();
        expect(sanitized.u).toBeUndefined();
        expect(sanitized.e).toEqual("");
        expect(sanitized.f).toEqual(false);
        expect(sanitized.deep.e).toEqual("");
        expect(sanitized.deep.n).toBeUndefined();
        expect(sanitized.deep.u).toBeUndefined();
        expect(sanitized.deep.f).toEqual(false);
        expect(sanitized.deep.eObj).toEqual({});
        expect(sanitized.eObj).toEqual({});
        expect(sanitized.shouldBeEmptyObj).toEqual({});
        expect(sanitized.caray.length).toEqual(2);
        expect(sanitized.caray[0]).toEqual({f: false});
        expect(sanitized.caray[1]).toEqual("beef");
    });
});