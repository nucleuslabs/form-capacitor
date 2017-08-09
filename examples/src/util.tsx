function pad(n: number) {
    return String(n).padStart(2,'0');
}

export function formatDate(d: Date) {
    let date = `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`;
    let time = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
    return `${date}T${time}`
}

/**
 * Removes one instance of `value` from `array`, without mutating the original array. Uses loose comparison.
 *
 * @param {Array} array Array to remove value from
 * @param {*|Function} value Value to remove
 * @returns {Array} Array with `value` removed
 */
export function arrayWithout(array, value) {
    let func = value;
    if(typeof value !== 'function') {
        func = (v,i) => v == value;
    }

    for(let i=0; i<array.length; ++i) {
        if(func(array[i],i)) {
            let copy = [...array];
            copy.splice(i, 1);
            return copy;
        }
    }
    return array;
}