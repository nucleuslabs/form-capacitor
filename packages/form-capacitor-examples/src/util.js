function pad(n) {
    return String(n).padStart(2,'0');
}

export function formatDate(d) {
    if(!d || Number.isNaN(d.valueOf())) {
        return '';
    }
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`;
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
            return arraySplice(array, i);
        }
    }
    return array;
}

/**
 * Removes an index from an array without mutating the original array.
 *
 * @param {Array} array Array to remove value from
 * @param {Number} index Index to remove
 * @param {Number} count
 * @param {Array} replaceWith
 * @returns {Array} Array with `value` removed
 */
export function arraySplice(array, index, count=1, replaceWith=[]) {
    if(index < array.length) {
        let copy = [...array];
        copy.splice(index, count, ...replaceWith);
        return copy;
    }
    return array;
}