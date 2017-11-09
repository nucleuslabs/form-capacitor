import createComponent from '../../createComponent';
import {withValue} from 'form-capacitor-state';
import {mapProps, omitProps, withProps, defaultProps, withState, withHandlers} from 'recompact';
import cc from 'classcat';
import SelectByIndex from '../SelectByIndex';
import PropTypes from 'prop-types';
import onPropsChange from '../../onPropsChange';
import {withErrors} from '../../../../form-capacitor-schema/src';
import {WarningIcon} from '../bulma';
import {withPath} from '../../../../form-capacitor-state/src';
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
        withPath(),
        withErrors(),
        withValue({
            valueProp: 'value',
            setValueProp: 'setValue',
            selfUpdate: false,
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
            // console.log('pachooo');

            // todo: if value isn't found in selectbox, maybe we should render it as an additional option and disable it?
            if(props.multiple) {
                let values;
                // noinspection CommaExpressionJS
                if(props.selectedIndex.length !== props.value.length || (values = new Set(props.value),props.selectedIndex.some(si => si < 0 || si > props.options.length || !values.has(props.options[si].value)))) {
                    props.setSelectedIndex(findIndex(props));
                }
            } else {
                if(props.selectedIndex < 0 || props.selectedIndex >= props.options.length || props.options[props.selectedIndex].value !== props.value) {
                    props.setSelectedIndex(findIndex(props));
                }
            }
      
            // }
        }),
        omitProps(['name', 'value', 'setValue', 'setSelectedIndex']),
    ],
    propTypes: {
        options: PropTypes.arrayOf(PropTypes.shape({
            value: PropTypes.any,
            label: PropTypes.string,
        })).isRequired,
        useValueAsKey: PropTypes.bool,
    },
    defaultProps: {
        useValueAsKey: false,
    },
    render: ({className, path, multiple, options, useValueAsKey, errors, ...props}) => {
        const hasErrors = errors && errors.length;
        // console.log(props.selectedIndex);
        return (
            <div className={cc(['control', className])}>
                <span className={cc(['select', {'is-multiple': multiple,'is-danger':hasErrors}])}>
                    <SelectByIndex id={path.join('.')} className={cc(['input'])} {...props} multiple={multiple}>
                        {options.map(({value, label, ...opt}, i) =>
                            <option {...opt} key={useValueAsKey ? value : i} children={label}/>)}
                    </SelectByIndex>
                 
                </span>
            </div>
        )
    }
})