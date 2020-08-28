import sanitizeDefaults from '../src/sanitizeDefaults';

//tests requiring mobx state tree
describe('sanitizeDefaults', function() {
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
            }
        };
        const sanitized = sanitizeDefaults(testPojo);
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
    });
});