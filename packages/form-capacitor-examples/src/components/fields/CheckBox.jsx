import createComponent from '../../createComponent';
import {withValue} from 'form-capacitor-state';
import {mapProps, omitProps, withProps, defaultProps, withState, withHandlers, withPropsOnChange} from 'recompact';
import cc from 'classcat';
import SelectByIndex from '../SelectByIndex';
import PropTypes from 'prop-types';
import onPropsChange from '../../onPropsChange';
// import withPropsOnChange from '../../withPropsOnChange';
// import dump from 'form-capacitor-util/dump';
import className from '../../className';
import {arraySplice} from '../../util';
// console.log(withValue);


export default createComponent({
    displayName: 'CheckBox',
    enhancers: [
        withValue({
            valueProp: 'checked',
            setValueProp: 'setChecked',
            pathProp: 'path'
        }),
        // withState('selectedIndex', 'setSelectedIndex', findIndex),
        withHandlers({
            onChange: ({setChecked, checked, multiple, value}) => ev => {
                if(multiple) {
                    if(ev.currentTarget.checked) {
                        setChecked(checked ? [...checked,value] : [value]);    
                    } else if(checked) {
                        let idx = checked.indexOf(value);
                        if(idx >= 0) {
                            setChecked(arraySplice(checked, idx));
                        }
                    }
                } else {
                    setChecked(ev.currentTarget.checked);
                }
            }
        }),
        withPropsOnChange(['checked','multiple','value'],({checked,multiple,value}) => ({
            checked: checked ? (multiple ? checked.includes(value) : !!checked) : false,
        })),
        // onPropsChange('value', (props,prevProps) => {
        //     if(props.selectedIndex === prevProps.selectedIndex) {
        //         // if the `value` changed but the `selectedIndex` didn't, then this was an external change -- update the index
        //         props.setSelectedIndex(findIndex(props));
        //     }
        // }),
        omitProps(['name','setChecked']),
        className(),
    ],
    render: ({id, path, multiple, value, ...props}) => {
        if(!id) {
            if(multiple) {
                if(typeof value === 'string' || typeof value === 'number') {
                    id = `${path.join('.')}[${value}]`;
                }
            } else {
                id = path.join('.');
            }
        }
        return (
            <input id={id} type="checkbox" {...props}/>
        )
    }
})