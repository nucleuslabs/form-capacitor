import cc from 'classcat';
import {withPropsOnChange, withProps} from 'recompose'; // https://github.com/neoziro/recompact/issues/91

export default function className(cssClass) {
    if(typeof cssClass === 'function') {
        return withProps(props => ({
           className: cc([cssClass(props), props.className]), 
        }))
    }
    return withPropsOnChange(['className'], ({className}) => {
        return {
            className: cssClass || className ? cc([cssClass, className]) : undefined
        }
    });
}