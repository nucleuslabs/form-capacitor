import React from 'react';
import field from '../../../src/hocs/field';
import {arrayWithout} from '../util';
import classNames from 'classnames';


export interface SelectBoxProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    multiple?: boolean,
    value: any,
    name: string,
    options: Array<{value: any, label: string}>,
}

export function SelectBox({options, path, name, multiple, ...attrs}: SelectBoxProps) {
    // console.log(options,multiple,attrs);
    return (
        <div className={classNames('select',{'is-multiple': multiple})}>
            <select {...attrs} multiple={multiple}>{options.map((opt,i) => <option key={i} value={i} children={opt.label}/>)}</select>
        </div>
    )
}

export default field({
    deserializeValue: (value, {options, multiple}) => {
        if(multiple) {
            let values = [];
            let set = new Set(value);
            for(let i=0; i<options.length; ++i) {
                if(set.has(options[i].value)) {
                    values.push(i);
                }
            }
            return values;
        } else {
            if (value === undefined) {
                return '0';
            }
            let index = options.findIndex(opt => Object.is(opt.value, value));
            return index < 0 ? '0' : String(index);
        }
    },
    serializeValue: (value, {options, multiple}) => { // FIXME: this can be done in eventHandler...
        if(multiple) {
            return value.map(i => options[i].value);
        } else {
            return options[value].value;
        }
        
    };
    eventHandler: (ev,{options,multiple}) => {
        if(multiple) {
            return Array.from(ev.currentTarget.selectedOptions).map(o => o.value);
        } else {
            return ev.currentTarget.value; // could return ev.currentTarget.selectedIndex if React let us set it this way...
        }
    },
})(SelectBox);