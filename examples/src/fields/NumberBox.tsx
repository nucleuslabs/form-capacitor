import React from 'react';
import field from '../../../src/hocs/field';


export type NumberBoxProps = React.InputHTMLAttributes<HTMLInputElement>;

export function NumberBox({path, name, ...attrs}: NumberBoxProps) {
    return (
        <div className="control">
            <input type="number" className="input" {...attrs}/>
        </div>
    )
}

export default field({
    eventHandler: ev => ev.currentTarget.valueAsNumber,
})(NumberBox);