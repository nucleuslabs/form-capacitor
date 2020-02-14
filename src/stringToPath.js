// https://github.com/lodash/lodash/blob/c1f805f4972843b675056b2786f1165f7db81737/.internal/stringToPath.js

import {isNumber} from "./helpers";

const charCodeOfDot = '.'.charCodeAt(0);
const reEscapeChar = /\\(\\)?/g;
const rePropName = RegExp(
    // Match anything that isn't a dot or bracket.
    // eslint-disable-next-line no-useless-concat
    '[^.[\\]]+' + '|'
    // Or match property names within brackets.
    // eslint-disable-next-line no-useless-concat
    + '\\[(?:'
    // Match a non-string expression.
    // eslint-disable-next-line no-useless-concat
    + '([^"\'].*)' + '|'
    // Or match strings (supports escaping characters).
    // eslint-disable-next-line no-useless-concat
    + '(["\'])((?:(?!\\2)[^\\\\]|\\\\.)*?)\\2'
    // eslint-disable-next-line no-useless-concat
    + ')\\]'+ '|'
    // Or match "" as the space between consecutive dots or empty brackets.
    // eslint-disable-next-line no-useless-concat
    + '(?=(?:\\.|\\[\\])(?:\\.|\\[\\]|$))'
    , 'g');
/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
export default function stringToPath(string) {
    const result = [];
    const convertedString = isNumber(string) ? `${string}` : string;
    if(convertedString.charCodeAt(0) === charCodeOfDot) {
        result.push('');
    }
    convertedString.replace(rePropName, (match, expression, quote, subString) => {
        let key = match;
        if(quote) {
            key = subString.replace(reEscapeChar, '$1');
        } else if(expression) {
            key = expression.trim();
        }
        result.push(key);
    });
    return result;
}
