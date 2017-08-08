import React from 'react';
import field from '../../../src/hocs/field';


export type NumberBoxProps = React.InputHTMLAttributes<HTMLInputElement>;

export function NumberBox(attrs: NumberBoxProps) {
    return <input type="number" className="form-control" {...attrs}/>
}

export default field({
    eventHandler: ev => ev.currentTarget.valueAsNumber,
})(NumberBox);