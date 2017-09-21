import React from 'react';
import field from '../../../src/hocs/field';
import {inputChanged} from 'form-capacitor';
import {compose, withPropsOnChange,pure} from 'recompose';
import whyRender from '../whyRender';


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
        eventHandler: ev => {
            let value = ev.currentTarget.valueAsNumber;
            return Number.isNaN(value) ? null : value;
        },
    }),
    withPropsOnChange(['value'], ({value}) => ({
        value: Number.isFinite(value) ? String(value) : '',
    })),
)(NumberBox);