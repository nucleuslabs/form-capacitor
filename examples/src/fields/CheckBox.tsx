import React from 'react';
import field from '../../../src/hocs/field';
import {arrayWithout} from '../util';
import {defaultProps, compose, withProps, withPropsOnChange} from 'recompose';


export interface CheckBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    multiple?: boolean,  
    checked: Set<any>|any,
    value?: any,
}

export function CheckBox({multiple, value, checked, name, path, ...attrs}: CheckBoxProps) {
    return <input type="checkbox" {...attrs} checked={multiple ? checked.has(value) : checked}/>
}

export default compose(
    field({
        valueProp: 'checked',
        eventHandler(ev, props: CheckBoxProps) {
            if(props.multiple) {
                if(ev.currentTarget.checked) {
                    return props.checked
                        ? new Set([...props.checked, props.value])
                        : new Set([props.value]);
                }
                let copy = new Set(props.checked);
                copy.delete(props.value);
                return copy;
            }
            return ev.currentTarget.checked;
        },
    }),
    withPropsOnChange(['checked','multiple'], ({checked,multiple}) => {
        if(multiple) {
            if(checked === undefined) {
                checked = new Set();
            }
        } else if(checked === undefined) {
            checked = false;
        }
        return {checked};
    })
)(CheckBox);

// export default field({
//     valueProp: 'checked',
//     deserializeValue(value, props) {
//         if(props.multiple) {
//             if(value === undefined) {
//                 return new Set();
//             }
//             return value;
//         }
//         if(value === undefined) {
//             return false;
//         }
//         return value;
//     },
//     eventHandler(ev, props: CheckBoxProps) {
//         if(props.multiple) {
//             if(ev.currentTarget.checked) {
//                 return new Set([...props.checked, props.value]);
//             }
//             let copy = new Set(props.checked);
//             copy.delete(props.value);
//             return copy;
//         } 
//         return ev.currentTarget.checked;
//     },
// })(CheckBox);