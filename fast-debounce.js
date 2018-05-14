function fastDebounce(fn) {
    let i = 0;
    return (...args) => {
        let j = (++i % Number.MAX_SAFE_INTEGER);
        return Promise.resolve()
            .then(() => {
                if(i === j) {
                    fn(...args);
                }
            })
    }
}

function slowDebounce(fn) {
    let t;
    return (a) => {
        clearTimeout(t);
        t = setTimeout(() => {
            fn(a);
        }, 0);
    }
}

let fdeb = fastDebounce(a => console.log('fast '+(performance.now()-a)));
let sdeb = slowDebounce(a => console.log('slow '+(performance.now()-a)));

// fast-debounce is 2 to 10 times faster!
fdeb(performance.now());
sdeb(performance.now());
