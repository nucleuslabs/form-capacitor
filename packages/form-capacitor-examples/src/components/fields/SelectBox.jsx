import createComponent from '../../createComponent';
import {withValue} from 'form-capacitor-state';
import {mapProps, omitProps, withProps, defaultProps, withState, withHandlers} from 'recompose';
import cc from 'classcat';
import SelectByIndex from '../SelectByIndex';
import PropTypes from 'prop-types';
import onPropsChange from '../../onPropsChange';
import {withErrors} from '../../../../form-capacitor-schema/src';
import {WarningIcon} from '../bulma';
import {withPath} from '../../../../form-capacitor-state/src';
import mount from '../../../../form-capacitor-state/src/mount';
import field from '../../field';
// import withPropsOnChange from '../../withPropsOnChange';
// import dump from 'form-capacitor-util/dump';

// console.log(withValue);

function findIndex({options, value, multiple}) {
    // console.log('value',value);
    if(multiple) {
        return value
            ? value.reduce((acc, val) => {
                const idx = options.findIndex(opt => opt.value === val);
                if(idx >= 0) acc.push(idx);
                return acc;
            }, [])
            : [];
    }

    return options.findIndex(opt => opt.value === value);
}

const INTERNAL_UPDATE = '__internal_selectbox_update__';

export default createComponent({
    displayName: 'SelectBox',
    enhancers: [
        // withState('selectedIndex', 'setSelectedIndex', -1),
        field({
            onChange: ({setValue, multiple, options, setSelectedIndex, setHasOption}) => ev => {
                setHasOption(true);
                if(multiple) {
                    const indices = Array.prototype.reduce.call(ev.currentTarget.options, (acc, opt, idx) => {
                        if(opt.selected) {
                            acc.push(idx);
                        }
                        return acc;
                    }, []);
                    setSelectedIndex(indices);
                    setValue(indices.map(i => options[i].value, INTERNAL_UPDATE));
                } else {
                    const index = ev.currentTarget.selectedIndex;
                    setSelectedIndex(index);
                    setValue(options[index].value, INTERNAL_UPDATE);
                }
            },
            withState: [
                {
                    valueProp: 'selectedIndex',
                    setProp: 'setSelectedIndex',
                    initial: -1,
                },
                {
                    valueProp: 'hasOption',
                    setProp: 'setHasOption',
                    initial: true,
                }
            ],
            valueChange(value, oldValue, context) {
                if(context !== INTERNAL_UPDATE) {
                    let index = findIndex({...this.props, value});
                    if(this.props.multiple) {
                        this.props.setSelectedIndex(index);
                    } else {
                        let hasOption = index >= 0 || value == null;
                        // console.log(hasOption,index);
                        this.props.setHasOption(hasOption);
                        this.props.setSelectedIndex(hasOption ? index : this.props.options.length);
                    }
                } 
            },
            // valueProp: 'value',
            omitProps: ['setSelectedIndex','setHasOption'],
        }),
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
    render: ({className, path, multiple, options, value, useValueAsKey, errors, hasOption, ...props}) => {
        const hasErrors = errors && errors.length;
        // console.log('value',value);
        return (
            <div className={cc(['control', className])}>
                <span className={cc(['select', {'is-multiple': multiple, 'is-danger': hasErrors, 'is-warning':!hasOption}])}>
                    <SelectByIndex id={path.join('.')} className={cc(['input'])} {...props} multiple={multiple}>
                        {options.map(({value, label, ...opt}, i) =>
                            <option {...opt} key={useValueAsKey ? value : i} children={label}/>)}
                        {hasOption ? null : <option children={value}/>}
                    </SelectByIndex>
                 
                </span>
            </div>
        )
    }
})