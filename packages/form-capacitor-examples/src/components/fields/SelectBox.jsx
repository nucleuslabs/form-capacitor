import createComponent from '../../createComponent';
import {withValue} from 'form-capacitor-state';
import {mapProps, omitProps, withProps, withPropsOnChange, defaultProps, withState} from 'recompact';
import cc from 'classcat';
import SelectByIndex from '../SelectByIndex';
import PropTypes from 'prop-types';
// import dump from 'form-capacitor-util/dump';

// console.log(withValue);

export default createComponent({
    displayName: 'SelectBox',
    enhancers: [
        withValue({
            valueProp: 'value',
            setValueProp: 'setValue',
            pathProp: 'path'
        }),
        // withState('selectedIndex', 'setSelectedIndex', ({options, value, multiple}) => multiple
        //     ? value.reduce((acc, val) => {
        //         const idx = options.findIndex(opt => opt.value === val);
        //         if(idx >= 0) acc.push(idx);
        //         return acc;
        //     }, [])
        //     : options.findIndex(opt => opt.value === value)
        // ),
        withPropsOnChange(['options', 'value', 'multiple'], ({options, value, multiple}) => {
            // console.log(options,value,multiple,options.findIndex(opt => opt.value === value));
            return {
                selectedIndex: multiple
                    ? value.reduce((acc, val) => {
                        const idx = options.findIndex(opt => opt.value === val);
                        if(idx >= 0) acc.push(idx);
                        return acc;
                    }, [])
                    : options.findIndex(opt => opt.value === value)
            }
        }),
        withProps(({setValue, multiple, options, setSelectedIndex}) => ({
            onChange(ev) {
                if(multiple) {
                    const values = Array.prototype.reduce.call(ev.currentTarget.options, (acc, opt, idx) => {
                        if(opt.selected) {
                            acc.push(options[idx].value);
                        }
                        return acc;
                    }, []);
                    setValue(values);
                } else {
                    const index = ev.currentTarget.selectedIndex;
                    // setSelectedIndex(index);
                    setValue(index < 0 ? null : options[index].value);
                }
            }
        })),
        // defaultProps({
        //     value: '', // prevents uncontrolled -> controlled warning
        // }),
        omitProps(['name', 'value', 'setValue', 'setSelectedIndex']),
    ],
    propTypes: {
        options: PropTypes.arrayOf(PropTypes.shape({
            value: PropTypes.any,
            label: PropTypes.string,
        })).isRequired
    },
    defaultProps: {
        useValueAsKey: false,
    },
    render: ({className, path, multiple, options, useValueAsKey, ...props}) => {
        return (
            <div className={cc(['select', {'is-multiple': multiple}, className])}>
                <SelectByIndex id={path.join('.')} className="input" {...props}>
                    {options.map(({value, label, ...opt}, i) =>
                        <option {...opt} key={useValueAsKey ? value : i} children={label}/>)}
                </SelectByIndex>
            </div>
        )
    }
})