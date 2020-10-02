import { looseSanitizer } from '../src';

//tests requiring mobx state tree
describe('looseSanitizer', function() {
    it('Should filter out empty strings, nulls, empty objects and empty iterables', async function() {
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
        const sanitized = looseSanitizer(testPojo);
        expect(sanitized).not.toEqual(testPojo);
        expect(sanitized.n).toBeUndefined();
        expect(sanitized.u).toBeUndefined();
        expect(sanitized.e).toBeUndefined();
        expect(sanitized.f).toEqual(false);
        expect(sanitized.deep.e).toBeUndefined();
        expect(sanitized.deep.n).toBeUndefined();
        expect(sanitized.deep.u).toBeUndefined();
        expect(sanitized.deep.f).toEqual(false);
        expect(sanitized.deep.eObj).toBeUndefined();
        expect(sanitized.eObj).toBeUndefined();
        expect(sanitized.shouldBeEmptyObj).toBeUndefined();
        expect(sanitized.caray.length).toEqual(2);
        expect(sanitized.caray[0]).toEqual({f: false});
        expect(sanitized.caray[1]).toEqual("beef");
    });
});
