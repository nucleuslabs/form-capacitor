import React from 'react';
import field from '../../../src/hocs/field';
import {arrayWithout} from '../util';
import classNames from 'classnames';
import SelectByIndex from './SelectByIndex';


export type SelectBoxProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
    multiple?: boolean,
    value: any,
    name: string|string[],
    options: Array<{value: any, label: string}>,
    path: string[],
}

export function SelectBox({options, path, value, name, multiple, ...attrs}: SelectBoxProps) {
    // console.log(options,multiple,attrs);
    
    const useValue = options.length && (typeof options[0].value === 'string' || typeof options[0].value === 'number');
    
    return (
        <div className={classNames('select',{'is-multiple': multiple})}>
            <SelectByIndex {...attrs} selectedIndex={value} multiple={multiple}>{options.map((opt,i) => <option key={useValue ? opt.value : i} children={opt.label}/>)}</SelectByIndex>
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
            return options.findIndex(opt => Object.is(opt.value, value));
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
            return Array.prototype.reduce.call(ev.currentTarget.options, (acc,opt,idx) => {
                if(opt.selected) {
                    acc.push(idx);
                }
                return acc;
            }, []);
        } else {
            return ev.currentTarget.selectedIndex; // could return ev.currentTarget.selectedIndex if React let us set it this way...
        }
    },
})(SelectBox);