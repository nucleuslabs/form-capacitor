import React from 'react';
import field from '../../../src/hocs/field';


// export interface RadioButtonProps extends React.InputHTMLAttributes<HTMLInputElement> {
//     name: string|string[],
// }

export type RadioButtonProps<TValue=string> = React.InputHTMLAttributes<HTMLInputElement> & {
    name: string|string[],
    group?: string,
    value: TValue,
    currentValue: TValue,
};

export function RadioButton({name, group, currentValue, value, ...attrs}: RadioButtonProps) {
    return <input type="radio" {...attrs} name={group || name} checked={value === currentValue} />
}

export default field({
    removeName: false,
    eventHandler: (ev,{value}) => value,
    valueProp: 'currentValue',
})(RadioButton);