import React from 'react';
import field from '../../../src/hocs/field';
import {arrayWithout} from '../util';


export interface CheckBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    multiple?: boolean,  
    currentValue: any[],
    value?: any,
}

export function CheckBox({multiple, value, currentValue, name, ...attrs}: CheckBoxProps) {
    return <input type="checkbox" {...attrs}/>
}

export default field({
    valueProp: 'currentValue',
    deserializeValue(value, props) {
        if(value !== undefined) {
            return value;
        }
        return props.multiple ? [] : false;
    },
    eventHandler(ev, props: CheckBoxProps) {
        if(props.multiple) {
            if(ev.currentTarget.checked) {
                return [...props.currentValue, props.value];
            }
            return arrayWithout(props.currentValue, props.value);
        } 
        return ev.currentTarget.checked;
    },
})(CheckBox);