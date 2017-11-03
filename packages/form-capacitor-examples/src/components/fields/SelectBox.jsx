import createComponent from '../../createComponent';
import {withValue} from 'form-capacitor-state';
import {mapProps, omitProps, withProps, defaultProps, withState, withHandlers} from 'recompact';
import cc from 'classcat';
import SelectByIndex from '../SelectByIndex';
import PropTypes from 'prop-types';
import onPropsChange from '../../onPropsChange';
// import withPropsOnChange from '../../withPropsOnChange';
// import dump from 'form-capacitor-util/dump';

// console.log(withValue);

function findIndex({options, value, multiple}) {
    // console.log('value',value);
    return multiple
        ? (value ? value.reduce((acc, val) => {
            const idx = options.findIndex(opt => opt.value === val);
            if(idx >= 0) acc.push(idx);
            return acc;
        }, []) :[])
        : options.findIndex(opt => opt.value === value);
}

export default createComponent({
    displayName: 'SelectBox',
    enhancers: [
        withValue({
            valueProp: 'value',
            setValueProp: 'setValue',
            pathProp: 'path'
        }),
        withState('selectedIndex', 'setSelectedIndex', findIndex),
        withHandlers({
            onChange: ({setValue, multiple, options, setSelectedIndex}) => ev => {
                if(multiple) {
                    const indices = Array.prototype.reduce.call(ev.currentTarget.options, (acc, opt, idx) => {
                        if(opt.selected) {
                            acc.push(idx);
                        }
                        return acc;
                    }, []);

                    setSelectedIndex(indices);
                    setValue(indices.map(i => options[i].value));
                } else {
                    const index = ev.currentTarget.selectedIndex;
                    setSelectedIndex(index);
                    setValue(options[index].value);
                }
            }
        }),
        onPropsChange('value', (props,prevProps) => {
            if(props.selectedIndex === prevProps.selectedIndex) {
                // if the `value` changed but the `selectedIndex` didn't, then this was an external change -- update the index
                props.setSelectedIndex(findIndex(props));
            }
        }),
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
                <SelectByIndex id={path.join('.')} className="input" {...props} multiple={multiple}>
                    {options.map(({value, label, ...opt}, i) =>
                        <option {...opt} key={useValueAsKey ? value : i} children={label}/>)}
                </SelectByIndex>
            </div>
        )
    }
})