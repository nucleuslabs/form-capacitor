import {
    EMPTY_ARRAY,
    EMPTY_OBJECT,
    EMPTY_MAP,
    EMPTY_SET,
    resolveValue,
    isNativeFunction,
    isFunction,
    isString,
    isNumber,
    isMap,
    isArray,
    isObject,
    isPlainObject,
    isSymbol,
    isNullish,
    setValue,
    getValue,
    setMap,
    getMap,
    delMap,
    toPath,
    toObservable,
    isError,
    isPromise,
    isBoolean,
    isRegExp,
    isDate,
    isSet,
    isWeakMap,
    isNull,
    isUndefined,
    setOrDel,
    isInt, isIntLoose
} from "../src/helpers";
import {ObservableMap, observable, isObservable, ObservableSet} from "mobx";


describe('EMPTY_ARRAY', function() {
    it('Should be a frozen Array', function() {
        expect(EMPTY_ARRAY).toBeFrozen();
        expect(EMPTY_ARRAY).toBeArray();
        expect(EMPTY_ARRAY).toEqual([]);
        expect(EMPTY_ARRAY).not.toEqual({});
    });
});

describe('EMPTY_OBJECT', function() {
    it('Should be an empty frozen Object', function() {
        expect(EMPTY_OBJECT).toBeFrozen();
        expect(EMPTY_OBJECT).toBeObject();
        expect(EMPTY_OBJECT).toMatchObject({});
        expect(EMPTY_OBJECT).not.toEqual([]);
    });
});

describe('EMPTY_MAP', function() {
    it('Should be a empty frozen Map', function() {
        expect(EMPTY_MAP).toBeFrozen();
        expect(EMPTY_MAP).toMatchObject(new Map());
        expect(EMPTY_MAP).not.toEqual({});
        expect(EMPTY_MAP).not.toEqual([]);
    });
});

describe('EMPTY_SET', function() {
    it('Should be a empty frozen Map', function() {
        expect(EMPTY_SET).toBeFrozen();
        expect(EMPTY_SET).toMatchObject(new Set());
        expect(EMPTY_SET).not.toMatchObject(new Map());
        expect(EMPTY_SET).not.toEqual({});
        expect(EMPTY_SET).not.toEqual([]);
    });
});

describe('resolveValue', function() {
    it('Should resolve all things to beef', function() {
        expect(resolveValue("beef")).toEqual("beef");
        expect(resolveValue(() => "beef")).toEqual("beef");

    });
});

describe('isNativeFunction', function() {
    it('Should be true if it is a native function or false if it is not', function() {
        const func = function() {
            return "beef";
        };
        expect(isNativeFunction(Object.assign)).toBeTrue();
        expect(isNativeFunction(func)).toBeFalse();
        expect(isNativeFunction(() => "beef")).toBeFalse();
        expect(isFunction(6335)).toBeFalse();
        expect(isFunction("beef")).toBeFalse();
        expect(isFunction({})).toBeFalse();
    });
});

describe('isFunction', function() {
    it('Should be true if it is a function or false if it is not', function() {
        const func = function() {
            return "beef";
        };
        expect(isFunction(Object.assign)).toBeTrue();
        expect(isFunction(func)).toBeTrue();
        expect(isFunction(() => "beef")).toBeTrue();
        expect(isFunction(6335)).toBeFalse();
        expect(isFunction("beef")).toBeFalse();
        expect(isFunction({})).toBeFalse();
    });
});

describe('isString', function() {
    it('Should be true if value is a String or false if it is not', function() {
        const beef = "beef";
        expect(isString("beef")).toBeTrue();
        expect(isString(`beef`)).toBeTrue();
        expect(isString(`${beef}`)).toBeTrue();
        expect(isString(String('beef'))).toBeTrue();
        expect(isString(6335)).toBeFalse();
        expect(isString(() => "beef")).toBeFalse();
        expect(isString({})).toBeFalse();
    });
});

describe('isNumber', function() {
    it('Should be true if it is a Number or false if it is not', function() {
        expect(isNumber(6335)).toBeTrue();
        expect(isNumber(6335.99394)).toBeTrue();
        expect(isNumber(10e+12)).toBeTrue();
        expect(isNumber(String('beef'))).toBeFalse();
        expect(isNumber(() => "beef")).toBeFalse();
        expect(isNumber({})).toBeFalse();
        expect(isNumber(`6335`)).toBeFalse();
    });
});

describe('isInt', function() {
    it('Should be true if it is a 32 bit integer or false if it is not', function() {
        expect(isInt(6335)).toBeTrue();
        expect(isInt(6335.99394)).toBeFalse();
        expect(isInt(10e+8)).toBeTrue();
        expect(isInt(10e+12)).toBeFalse();
        expect(isInt(String('beef'))).toBeFalse();
        expect(isInt(() => "beef")).toBeFalse();
        expect(isInt({})).toBeFalse();
        expect(isInt(`6335`)).toBeFalse();
    });
});

describe('isIntLoose', function() {
    it('Should be true if it is a 32 bit integer/a string containing a 32 bit integer or false if it is not', function() {
        expect(isIntLoose(6335)).toBeTrue();
        expect(isIntLoose(6335.99394)).toBeFalse();
        expect(isIntLoose(10e+8)).toBeTrue();
        expect(isIntLoose(10e+12)).toBeFalse();
        expect(isIntLoose(String('beef'))).toBeFalse();
        expect(isIntLoose(() => "beef")).toBeFalse();
        expect(isIntLoose({})).toBeFalse();
        expect(isIntLoose(`6335`)).toBeTrue();
    });
});

describe('isPromise', function() {
    it('Should be true if it is a Promise or false if it is not', function() {
        expect(isPromise(new Promise((resolver) => resolver(true)))).toBeTrue();
        expect(isPromise(String('beef'))).toBeFalse();
        expect(isPromise(new Map())).toBeFalse();
        expect(isPromise(() => "beef")).toBeFalse();
        expect(isPromise(`6335`)).toBeFalse();
    });
});

describe('isBoolean', function() {
    it('Should be true if it is a Boolean or false if it is not', function() {
        let c = false;
        expect(isBoolean(c)).toBeTrue();
        expect(isBoolean(String('beef'))).toBeFalse();
        expect(isBoolean(new Map())).toBeFalse();
        expect(isBoolean(() => "beef")).toBeFalse();
        expect(isBoolean(`6335`)).toBeFalse();
    });
});

describe('isRegExp', function() {
    it('Should be true if it is a Regular Expression or false if it is not', function() {
        let c = /\w/;
        expect(isRegExp(c)).toBeTrue();
        expect(isRegExp(String('beef'))).toBeFalse();
        expect(isRegExp(new Map())).toBeFalse();
        expect(isRegExp(() => "beef")).toBeFalse();
        expect(isRegExp(`6335`)).toBeFalse();
    });
});

describe('isDate', function() {
    it('Should be true if it is a Regular Expression or false if it is not', function() {
        let c = new Date();
        expect(isDate(c)).toBeTrue();
        expect(isDate(String('beef'))).toBeFalse();
        expect(isDate(new Map())).toBeFalse();
        expect(isDate(() => "beef")).toBeFalse();
        expect(isDate(`6335`)).toBeFalse();
    });
});

describe('isSet', function() {
    it('Should be true if it is a Map/ObservableMap or false if it is not', function() {
        expect(isSet(new Set())).toBeTrue();
        expect(isSet(new Set([["beef", "soup"]]))).toBeTrue();
        expect(isSet(new ObservableSet([["beef", "soup"]]))).toBeTrue();
        expect(isSet(new ObservableSet(["soup"]))).toBeTrue();
        expect(isSet(new ObservableSet([1, 2, 3, 4, "beef"]))).toBeTrue();
        expect(isSet(String('beef'))).toBeFalse();
        expect(isSet(() => "beef")).toBeFalse();
        expect(isSet({})).toBeFalse();
        expect(isSet(`6335`)).toBeFalse();
        expect(isSet([1, 2, 3, 4, "beef"])).toBeFalse();
    });
});

describe('isMap', function() {
    it('Should be true if it is a Map/ObservableMap or false if it is not', function() {
        expect(isMap(new Map())).toBeTrue();
        expect(isMap(new Map([["beef", "soup"]]))).toBeTrue();
        expect(isMap(new WeakMap())).toBeTrue();
        expect(isMap(new ObservableMap([["beef", "soup"]]))).toBeTrue();
        expect(isMap(new ObservableMap({beef: "soup"}))).toBeTrue();
        expect(isMap(new ObservableMap([1, 2, 3, 4, "beef"]))).toBeTrue();
        expect(isMap(String('beef'))).toBeFalse();
        expect(isMap(() => "beef")).toBeFalse();
        expect(isMap({})).toBeFalse();
        expect(isMap(`6335`)).toBeFalse();
        expect(isMap([1, 2, 3, 4, "beef"])).toBeFalse();
    });
});

describe('isArray', function() {
    it('Should be true if it is an Array/ObservableArray or false if it is not', function() {
        expect(isArray([])).toBeTrue();
        expect(isArray([["beef", "soup"]])).toBeTrue();
        expect(isArray(observable.array([["beef", "soup"]]))).toBeTrue();
        expect(isArray(observable.array([1, 2, 3, 4, "beef"]))).toBeTrue();
        expect(isArray(String('beef'))).toBeFalse();
        expect(isArray(() => "beef")).toBeFalse();
        expect(isArray({})).toBeFalse();
        expect(isArray(`6335`)).toBeFalse();
    });
});

describe('isObject', function() {
    it('Should be true if it is an Object or false if it is not', function() {
        expect(isObject({})).toBeTrue();
        expect(isObject(Object.assign({veggie: "soup"}, {beef: "soup"}))).toBeTrue();
        expect(isObject(String('beef'))).toBeFalse();
        expect(isObject(() => "beef")).toBeFalse();
        expect(isObject(`6335`)).toBeFalse();
    });
});

describe('isWeakMap', function() {
    it('Should be true if it is a WeakMap or false if it is not', function() {
        expect(isWeakMap(new WeakMap())).toBeTrue();
        expect(isWeakMap(new Map())).toBeFalse();
        expect(isWeakMap(new Map([["beef", "soup"]]))).toBeFalse();
        expect(isWeakMap(new ObservableMap([["beef", "soup"]]))).toBeFalse();
        expect(isWeakMap(String('beef'))).toBeFalse();
        expect(isWeakMap(() => "beef")).toBeFalse();
        expect(isWeakMap({})).toBeFalse();
        expect(isWeakMap(`6335`)).toBeFalse();
        expect(isWeakMap([1, 2, 3, 4, "beef"])).toBeFalse();
    });
});

describe('isNull', function() {
    it('Should be true if it is Null or false if it is not', function() {
        let c = null;
        expect(isNull(c)).toBeTrue();
        expect(isNull(undefined)).toBeFalse();
        expect(isNull(String('beef'))).toBeFalse();
        expect(isNull(new Map())).toBeFalse();
        expect(isNull(() => "beef")).toBeFalse();
        expect(isNull(`6335`)).toBeFalse();
    });
});

describe('isNullish', function() {
    it('Should be true if it is Nullish or false if it is not', function() {
        let c = null;
        expect(isNullish(c)).toBeTrue();
        expect(isNullish(undefined)).toBeTrue();
        expect(isNullish(String('beef'))).toBeFalse();
        expect(isNullish(new Map())).toBeFalse();
        expect(isNullish(() => "beef")).toBeFalse();
        expect(isNullish(`6335`)).toBeFalse();
    });
});

describe('isUndefined', function() {
    it('Should be true if it is undefined or false if it is not', function() {
        let c = null;
        expect(isUndefined(undefined)).toBeTrue();
        expect(isUndefined(c)).toBeFalse();
        expect(isUndefined(String('beef'))).toBeFalse();
        expect(isUndefined(new Map())).toBeFalse();
        expect(isUndefined(() => "beef")).toBeFalse();
        expect(isUndefined(`6335`)).toBeFalse();
    });
});

describe('isPlainObject', function() {
    it('Should be true if it is a Plain Object or false if it is not', function() {
        expect(isPlainObject({})).toBeTrue();
        expect(isPlainObject(Object.assign({veggie: "soup"}, {beef: "soup"}))).toBeTrue();
        expect(isPlainObject(String('beef'))).toBeFalse();
        expect(isPlainObject(new Map())).toBeFalse();
        expect(isPlainObject(() => "beef")).toBeFalse();
        expect(isPlainObject(`6335`)).toBeFalse();
    });
});

describe('isSymbol', function() {
    it('Should be true if it is a Symbol or false if it is not', function() {
        expect(isSymbol(Symbol("s"))).toBeTrue();
        expect(isSymbol(String('beef'))).toBeFalse();
        expect(isSymbol(new Map())).toBeFalse();
        expect(isSymbol(() => "beef")).toBeFalse();
        expect(isSymbol(`6335`)).toBeFalse();
    });
});

describe('isError', function() {
    it('Should be true if it is an Error Object or false if it is not', function() {
        expect(isError(new Error("Test Error"))).toBeTrue();
        expect(isError(String('beef'))).toBeFalse();
        expect(isError(new Map())).toBeFalse();
        expect(isError(() => "beef")).toBeFalse();
        expect(isError(`6335`)).toBeFalse();
    });
});


//@todo make more comprehensive tests for setValue that covers all exception cases
describe('setValue', function() {
    it('Should set Values in an observable object using various paths', function() {
        let obsObj = observable({Hello: "World"});
        let obsObjDeeper = observable({
            Hello: observable({
                World: "Yeah"
            })
        });
        setValue(obsObj, ["Hello"], "Dolly");
        expect(obsObj.Hello).toBe('Dolly');
        setValue(obsObjDeeper, ["Hello", "World"], "Dolly");
        expect(obsObjDeeper.Hello.World).toBe('Dolly');
        setValue(obsObjDeeper, "Hello.World", "Dolly2");
        expect(obsObjDeeper.Hello.World).toBe('Dolly2');

    });
});

describe('getValue', function() {
    it('Should get Values in an observable object using various paths', function() {
        let obsObj = observable({Hello: "World"});
        let nObj = observable({});
        let obsObjDeeper = observable({
            Hello: observable({
                World: "Yeah"
            })
        });
        expect(getValue(obsObj, ["Hello"])).toBe('World');
        expect(getValue(nObj, ["Hello"], "World")).toBe('World');
        expect(getValue(obsObjDeeper, ["Hello", "World"])).toBe('Yeah');
        expect(getValue(obsObjDeeper, "Hello.World")).toBe('Yeah');
    });
});

describe('setMap', function() {
    it('Should set Values in an ObservableMap using various paths', function() {
        let obsMap = observable.map();
        let obsMap2 = observable.map();
        setMap(obsMap, ["Hello"], "Dolly");
        expect(obsMap.get("Hello")).toBe('Dolly');
        setMap(obsMap2, ["Hello", "World"], "Dolly");
        expect(obsMap2.get("Hello").get("World")).toBe('Dolly');
        setMap(obsMap2, "Hello.World", "Dolly2");
        expect(obsMap2.get("Hello").get("World")).toBe('Dolly2');
    });
});

describe('getMap', function() {
    it('Should set Values in an ObservableMap using various paths', function() {
        let obsMap = observable.map({"Hello": "World"});
        let obsMap2 = observable.map({"Hello": observable.map({World: "Yeah"})});
        expect(getMap(obsMap, "Hello")).toBe('World');
        expect(getMap(obsMap2, ["Hello", "World"])).toBe('Yeah');
        expect(getMap(obsMap2, "Hello.World")).toBe('Yeah');
    });
});

describe('detMap', function() {
    it('Should set Values in an ObservableMap using various paths', function() {
        let obsMap = observable.map({"Hello": "World", "Hi": "Earth"});
        let obsMap2 = observable.map({"Hello": observable.map({World: "Yeah", Earth: "No"})});
        expect(obsMap.has("Hi")).toBeTrue();
        delMap(obsMap, "Hi");
        expect(obsMap.has("Hi")).toBeFalse();
        expect(obsMap2.get("Hello").has("Earth")).toBeTrue();
        delMap(obsMap2, ["Hello", "Earth"]);
        expect(obsMap2.get("Hello").has("Earth")).toBeFalse();
        expect(obsMap2.get("Hello").has("World")).toBeTrue();
        delMap(obsMap2, "Hello.World");
        expect(obsMap2.get("Hello")).toBeUndefined();
    });
});

describe('setorDel', function() {
    it('Should set Values in an ObservableMap using various paths', function() {
        let obsMap = observable.map();
        setOrDel(obsMap, true, ["Hello"], "Dolly");
        expect(obsMap.get("Hello")).toBe('Dolly');
        setOrDel(obsMap, true, ["Goodbye"], "Everybody");
        expect(obsMap.get("Goodbye")).toBe('Everybody');
        setOrDel(obsMap, false, ["Goodbye"], "Everybody");
        expect(obsMap.has("Goodbye")).toBeFalse();

    });
});

describe('toPath', function() {
    it('Should covert an dot path to an Array', function() {
        expect(toPath("my.cool.path")).toEqual(["my", "cool", "path"]);
    });
});

describe('toObservable', function() {
    it('Should covert a regular object to an observable', function() {
        expect(toObservable({beef: {"cake": "isGood"}})).toEqual(observable({beef: {"cake": "isGood"}}));
        expect(toObservable("String")).not.toEqual("String");
        expect(isObservable(toObservable({beef: {"cake": "isGood"}}))).toBeTrue();
    });
});