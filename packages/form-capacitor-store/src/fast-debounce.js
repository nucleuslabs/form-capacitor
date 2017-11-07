export default function debounce(fn) {
    let i = 0;
    return (...args) => {
        i = (i+1) % Number.MAX_SAFE_INTEGER;
        let j = i;
        return Promise.resolve()
            .then(() => {
                if(i === j) {
                    fn(...args);
                } else {
                    console.warn('debounced',...args); // TODO: remove this warning. was just checking how often it fires. 
                }
            })
    }
}