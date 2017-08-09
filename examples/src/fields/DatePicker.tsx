import React from 'react';
import field from '../../../src/hocs/field';
import {formatDate} from '../util';


export type DatePickerProps = React.InputHTMLAttributes<HTMLInputElement>;

export function DatePicker(attrs: DatePickerProps) {
    return <input type="datetime-local" className="form-control" {...attrs}/>
}

export default field({
    eventHandler: ev => new Date(ev.currentTarget.valueAsNumber),
    deserializeValue: d => d ? formatDate(d) : '',
})(DatePicker);