import cc from 'classcat';
import {withPropsOnChange} from 'recompact'; // https://github.com/neoziro/recompact/issues/91

export default function className(cssClass) {
    return withPropsOnChange(['className'], ({className}) => {
        return {
            className: cssClass || className ? cc([cssClass, className]) : undefined
        }
    });
}