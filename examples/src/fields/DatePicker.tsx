import React from 'react';
import field from '../../../src/hocs/field';
import {formatDate} from '../util';


export type DatePickerProps = React.InputHTMLAttributes<HTMLInputElement>;

export function DatePicker({path, name, ...attrs}: DatePickerProps) {
    return <input type="datetime-local" className="input" {...attrs}/>
}

export default field({
    eventHandler: ev => new Date(ev.currentTarget.valueAsNumber),
    deserializeValue: d => d ? formatDate(d) : '',
})(DatePicker);