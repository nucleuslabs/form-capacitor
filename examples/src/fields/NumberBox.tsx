import React from 'react';
import field from '../../../src/hocs/field';
import {inputChanged} from 'form-capacitor';
import {compose, withPropsOnChange} from 'recompose';


export type NumberBoxProps = React.InputHTMLAttributes<HTMLInputElement>;

export function NumberBox({path, name, ...attrs}: NumberBoxProps) {
    return (
        <div className="control">
            <input type="number" className="input" {...attrs}/>
        </div>
    )
}

export default compose(
    field({
        eventHandler: ev => ev.currentTarget.valueAsNumber,
    }),
    withPropsOnChange(['value'], ({value}) => {
        if(value === undefined) {
            return {value: ''};
        }
    })
)(NumberBox);