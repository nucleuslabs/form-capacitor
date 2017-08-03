function memoize(fn) {
    let lastArgs, lastValue;
    return function memoized(...args) {
        // console.log(args,lastArgs,lastArgs !== undefined && arrayEqual(args, lastArgs));
        if(lastArgs !== undefined && arrayEqual(args, lastArgs)) {
            return lastValue;
        }
        lastArgs = args;
        lastValue = fn(...args);
        return lastValue;
    }
}

function arrayEqual(arr1, arr2) {
    return arr1.length === arr2.length && arr1.every((v,i) => Object.is(v,arr2[i]));
}
