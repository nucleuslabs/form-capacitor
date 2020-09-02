import {
    EMPTY_STRINGS,
    FALSE,
    ZERO,
    NULLS,
    sanitizeTree,
    EMPTY_SCALARS,
    FALSY,
    emptyStringNullSanitizer,
    EMPTY_MAPS,
    EMPTY_SETS,
    EMPTY_ARRAYS,
    EMPTY_OBJECTS
} from '../src/sanitizers';


const testPojo = {
    firstName: 'Freddy',
    lastName: 'Two Toes',
    e: '',
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
        { n: null, f: false },
        undefined,
        null,
        '',
        0,
        'beef'
    ],
    map: new Map([['n', null], ['f', false], ['e', ''], ['z', 0], ['u', undefined]]),
    set: new Set([null, false, '', 0, 'beef', undefined]),
    emptyMap: new Map(),
    emptySet: new Set(),
    nan: NaN
};

//tests requiring mobx state tree
describe('sanitizeTree', function () {
    it('Should collapse false empty strings and zero to undefined', async function () {
        const sanitized = sanitizeTree(testPojo, EMPTY_STRINGS | FALSE | ZERO);
        // console.log(testPojo, sanitized);
        expect(sanitized).not.toEqual(testPojo);
        expect(sanitized.n).toBeNull();
        expect(sanitized.u).toBeUndefined();
        expect(sanitized.e).toBeUndefined();
        expect(sanitized.f).toBeUndefined();
        expect(sanitized.deep.e).toBeUndefined();
        expect(sanitized.deep.n).toBeNull();
        expect(sanitized.deep.u).toBeUndefined();
        expect(sanitized.deep.f).toBeUndefined();
        expect(sanitized.deep.eObj).toEqual({});
        expect(sanitized.eObj).toEqual({});
        expect(sanitized.shouldBeEmptyObj).toEqual({ n: null });
        expect(sanitized.caray.length).toEqual(3);
        expect(sanitized.caray[0]).toEqual({ n: null });
        expect(sanitized.caray[1]).toEqual(null);
        expect(sanitized.caray[2]).toEqual('beef');
        expect(sanitized.map.has('n')).toEqual(true);
        expect(sanitized.map.has('f')).toEqual(false);
        expect(sanitized.map.has('z')).toEqual(false);
        expect(sanitized.map.has('e')).toEqual(false);
        expect(sanitized.map.has('u')).toEqual(false);
        expect(sanitized.set.has(null)).toEqual(true);
        expect(sanitized.set.has('beef')).toEqual(true);
        expect(sanitized.set.has('')).toEqual(false);
        expect(sanitized.set.has(false)).toEqual(false);
        expect(sanitized.set.has(0)).toEqual(false);
        expect(sanitized.set.has(undefined)).toEqual(false);
        expect(sanitized.nan).toEqual(NaN);
    });
    it('Should collapse empty scalars to undefined', async function () {
        const sanitized2 = sanitizeTree(testPojo, EMPTY_SCALARS);
        expect(sanitized2).not.toEqual(testPojo);
        expect(sanitized2.n).toBeUndefined();
        expect(sanitized2.u).toBeUndefined();
        expect(sanitized2.e).toBeUndefined();
        expect(sanitized2.f).toBeUndefined();
        expect(sanitized2.deep.e).toBeUndefined();
        expect(sanitized2.deep.n).toBeUndefined();
        expect(sanitized2.deep.u).toBeUndefined();
        expect(sanitized2.deep.f).toBeUndefined();
        expect(sanitized2.deep.eObj).toEqual({});
        expect(sanitized2.eObj).toEqual({});
        expect(sanitized2.shouldBeEmptyObj).toEqual({});
        expect(sanitized2.caray.length).toEqual(2);
        expect(sanitized2.caray[0]).toEqual({});
        expect(sanitized2.caray[1]).toEqual('beef');
        expect(sanitized2.map.has('n')).toEqual(false);
        expect(sanitized2.map.has('f')).toEqual(false);
        expect(sanitized2.map.has('z')).toEqual(false);
        expect(sanitized2.map.has('e')).toEqual(false);
        expect(sanitized2.map.has('u')).toEqual(false);
        expect(sanitized2.set.has(null)).toEqual(false);
        expect(sanitized2.set.has('beef')).toEqual(true);
        expect(sanitized2.set.has('')).toEqual(false);
        expect(sanitized2.set.has(false)).toEqual(false);
        expect(sanitized2.set.has(0)).toEqual(false);
        expect(sanitized2.set.has(undefined)).toEqual(false);
    });
    it('Should collapse falsy values to undefined', async function () {
        const sanitized3 = sanitizeTree(testPojo, FALSY,['beef']);
        expect(sanitized3).not.toEqual(testPojo);
        expect(sanitized3.n).toBeUndefined();
        expect(sanitized3.u).toBeUndefined();
        expect(sanitized3.e).toBeUndefined();
        expect(sanitized3.f).toBeUndefined();
        expect(sanitized3.deep.e).toBeUndefined();
        expect(sanitized3.deep.n).toBeUndefined();
        expect(sanitized3.deep.u).toBeUndefined();
        expect(sanitized3.deep.f).toBeUndefined();
        expect(sanitized3.deep.eObj).toEqual({});
        expect(sanitized3.eObj).toEqual({});
        expect(sanitized3.shouldBeEmptyObj).toEqual({});
        expect(sanitized3.caray.length).toEqual(1);
        expect(sanitized3.caray[0]).toEqual({});
        expect(sanitized3.map.has('n')).toEqual(false);
        expect(sanitized3.map.has('f')).toEqual(false);
        expect(sanitized3.map.has('z')).toEqual(false);
        expect(sanitized3.map.has('e')).toEqual(false);
        expect(sanitized3.map.has('u')).toEqual(false);
        expect(sanitized3.set.has(null)).toEqual(false);
        expect(sanitized3.set.has('beef')).toEqual(false);
        expect(sanitized3.set.has('')).toEqual(false);
        expect(sanitized3.set.has(false)).toEqual(false);
        expect(sanitized3.set.has(0)).toEqual(false);
        expect(sanitized3.set.has(undefined)).toEqual(false);
        expect(sanitized3.nan).toBeUndefined();
    });
    it('Should collapse empty strings and nulls to undefined', async function () {
        const sanitized4 = emptyStringNullSanitizer(testPojo);
        expect(sanitized4).not.toEqual(testPojo);
        expect(sanitized4.n).toBeUndefined();
        expect(sanitized4.u).toBeUndefined();
        expect(sanitized4.e).toBeUndefined();
        expect(sanitized4.f).toEqual(false);
        expect(sanitized4.deep.e).toBeUndefined();
        expect(sanitized4.deep.n).toBeUndefined();
        expect(sanitized4.deep.u).toBeUndefined();
        expect(sanitized4.deep.f).toEqual(false);
        expect(sanitized4.deep.eObj).toEqual({});
        expect(sanitized4.eObj).toEqual({});
        expect(sanitized4.shouldBeEmptyObj).toEqual({});
        expect(sanitized4.caray.length).toEqual(3);
        expect(sanitized4.caray[0]).toEqual({"f": false});
        expect(sanitized4.caray[1]).toEqual(0);
        expect(sanitized4.caray[2]).toEqual('beef');
        expect(sanitized4.map.has('n')).toEqual(false);
        expect(sanitized4.map.has('f')).toEqual(true);
        expect(sanitized4.map.has('z')).toEqual(true);
        expect(sanitized4.map.has('e')).toEqual(false);
        expect(sanitized4.map.has('u')).toEqual(false);
        expect(sanitized4.set.has(null)).toEqual(false);
        expect(sanitized4.set.has('beef')).toEqual(true);
        expect(sanitized4.set.has('')).toEqual(false);
        expect(sanitized4.set.has(false)).toEqual(true);
        expect(sanitized4.set.has(0)).toEqual(true);
        expect(sanitized4.set.has(undefined)).toEqual(false);
    });
    it('Should collapse many things and throw errors when you feed it bad things', async function () {
        const sanitized5 = sanitizeTree(testPojo, EMPTY_MAPS | EMPTY_SETS | EMPTY_ARRAYS | EMPTY_OBJECTS | NULLS | EMPTY_STRINGS | FALSE | ZERO, ['beef']);
        expect(sanitized5.emptyMap).toBeUndefined();
        expect(sanitized5.emptySet).toBeUndefined();
        expect(sanitized5.eObj).toBeUndefined();
        expect(sanitized5.caray).toBeUndefined();

        const setAttack = new Set(["booyah"]);
        try {
            sanitizeTree(setAttack);
        } catch (err) {
            expect(err.message).toEqual(`Form capacitors built-in sanitization algorithms only works on POJO's. '${typeof setAttack}' detected.`);
        }
        const nope = 'nope';
        try{
            sanitizeTree(testPojo, 0, nope);
        } catch (err) {
            expect(err.message).toEqual(`convertSpecificScalarValuesToUndefined can only be undefined or an array of scalar values. '${typeof nope}' detected.`);
        }

    });
});