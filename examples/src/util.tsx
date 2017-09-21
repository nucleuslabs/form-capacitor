function pad(n: number) {
    return String(n).padStart(2,'0');
}

export function formatDate(d: Date) {
    if(!d || Number.isNaN(d.valueOf())) {
        return '';
    }
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
            return arraySplice(array, i);
        }
    }
    return array;
}


export function arraySplice(array, start, deleteCount=1, ...items) {
    let copy = [...array];
    copy.splice(start, deleteCount, ...items);
    return copy;
}

export const mapValues = (obj, func) => {
    // lifted from https://github.com/acdlite/recompose/blob/72eae6758e73ae2c8d094a33a1b3f09c32a36fff/src/packages/recompose/utils/mapValues.js
    const result = {}
    /* eslint-disable no-restricted-syntax */
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            result[key] = func(obj[key], key)
        }
    }
    /* eslint-enable no-restricted-syntax */
    return result
}
