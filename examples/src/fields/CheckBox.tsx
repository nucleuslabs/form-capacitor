import React from 'react';
import field from '../../../src/hocs/field';
import {arrayWithout} from '../util';


export interface CheckBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    multiple?: boolean,  
    checked: Set<any>|any,
    value?: any,
}

export function CheckBox({multiple, value, checked, name, path, ...attrs}: CheckBoxProps) {
    return <input type="checkbox" {...attrs} checked={multiple ? checked.has(value) : checked}/>
}

export default field({
    valueProp: 'checked',
    deserializeValue(value, props) {
        if(props.multiple) {
            if(value === undefined) {
                return new Set();
            }
            return value;
        }
        if(value === undefined) {
            return false;
        }
        return value;
    },
    eventHandler(ev, props: CheckBoxProps) {
        if(props.multiple) {
            if(ev.currentTarget.checked) {
                return new Set([...props.checked, props.value]);
            }
            let copy = new Set(props.checked);
            copy.delete(props.value);
            return copy;
        } 
        return ev.currentTarget.checked;
    },
})(CheckBox);