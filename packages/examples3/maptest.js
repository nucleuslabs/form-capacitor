
function setMap(map, path, value) {
    path = toPath(path);
    if(!path.length) {
        throw new Error("Cannot set root");
    }
    const end = path.length - 1;
    let it = map;
    for(let i = 0; i < end; ++i) {
        const key = path[i];
        if(it.has(key)) {
            it = it.get(key);
        } else {
            const next = new Map;
            it.set(key, next);
            it = next;
        }
    }
    it.set(path[end], value);
    return map;
}

function toPath(value) {
    if(Array.isArray(value)) {
        return value;
    }
    return stringToPath(value);
}

const charCodeOfDot = ".".charCodeAt(0);
const reEscapeChar = /\\(\\)?/g;
const rePropName = RegExp(
    // Match anything that isn't a dot or bracket.
    "[^.[\\]]+" +
    "|" +
    // Or match property names within brackets.
    "\\[(?:" +
    // Match a non-string expression.
    "([^\"'].*)" +
    "|" +
    // Or match strings (supports escaping characters).
    "([\"'])((?:(?!\\2)[^\\\\]|\\\\.)*?)\\2" +
    ")\\]" +
    "|" +
    // Or match "" as the space between consecutive dots or empty brackets.
    "(?=(?:\\.|\\[\\])(?:\\.|\\[\\]|$))",
    "g"
);

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
function stringToPath(string) {
    const result = [];
    if(string.charCodeAt(0) === charCodeOfDot) {
        result.push("");
    }
    string.replace(rePropName, (match, expression, quote, subString) => {
        let key = match;
        if(quote) {
            key = subString.replace(reEscapeChar, "$1");
        } else if(expression) {
            key = expression.trim();
        }
        result.push(key);
    });
    return result;
}

function delMap(map, path) {
    if(!map) {
        throw new Error("Map required");
    }
    path = toPath(path);
    if(!path.length) {
        throw new Error("Cannot delete root");
    }
    return delMapR(map, path);
}


function delMapR(map, path) {
    if(path.length > 1) {
        const [first, ...rest] = path;
        const next = map.get(first);
        if(!next) return false;
        const deleted = delMapR(next, rest);
        if(!next.size) map.delete(first)
        return deleted;
    } 
    return map.delete(path[0]);
}

const m = new Map;
setMap(m,['a','b','c1'],1);
setMap(m,['a','b','c2'],2);
console.log(m);
console.log(delMap(m,['a','b','c1']));
console.log(delMap(m,['a','b','c1']));
console.log(m);
console.log(delMap(m,['a','b','c2']));
console.log(delMap(m,['a','b','c2']));
console.log(m);
