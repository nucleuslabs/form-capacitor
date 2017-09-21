import React from 'react';
import field from '../../../src/hocs/field';
import {formatDate} from '../util';
import {compose, withPropsOnChange} from 'recompose';
import * as Types from '../SchemaTypes';
import withSchema from '../../../src/hocs/withSchema';


export type DatePickerProps = React.InputHTMLAttributes<HTMLInputElement>;

export function DatePicker({path, name, ...attrs}: DatePickerProps) {
    return <input type="datetime-local" className="input" {...attrs}/>
}

export default compose(
    field({
        eventHandler: ev => {
            let number = ev.currentTarget.valueAsNumber;
            if(!Number.isFinite(number)) {
                return null;
            }
            let date = new Date(ev.currentTarget.valueAsNumber);
            if(!Number.isFinite(date.valueOf())) {
                return null;
            }
            return date;
        },
    }),
    withSchema({
        schema: {
            anyOf: [
                {
                    instanceof: 'Date',
                },
                {
                    type: 'null'
                }
            ],
        }
    }),
    withPropsOnChange(['value'], ({value}) => ({
        value: value ? formatDate(value) : '',
    })),
    // withSchema({
    //     schema: Types.string({
    //         // The format is "yyyy-MM-ddThh:mm" followed by optional ":ss" or ":ss.SSS".
    //         pattern: String.raw`^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?$`,
    //     })
    // }),
)(DatePicker);
