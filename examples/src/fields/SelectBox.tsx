import React from 'react';
import field from '../../../src/hocs/field';
import {arrayWithout} from '../util';


export interface SelectBoxProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    multiple?: boolean,
    value: any,
    name: string,
    options: Array<{value: any, label: string}>,
}

export function SelectBox({options, ...attrs}: SelectBoxProps) {
    return <select {...attrs}>{options.map((opt,i) => <option key={i} value={i} children={opt.label}/>)}</select>
}

export default field({
    deserializeValue: (value, {options}) => {
        if(value === undefined) {
            return '0';
        }
        let index = options.findIndex(opt => opt.value === value);
        return index < 0 ? '0': String(index);
    },
    serializeValue: (value, {options}) => options[value].value;
    eventHandler: ev => ev.currentTarget.value,
})(SelectBox);