import createComponent from '../../createComponent';
import {withValue} from 'form-capacitor-state';
import {mapProps, omitProps, withProps, defaultProps, withState, withHandlers, withPropsOnChange} from 'recompose';
import cc from 'classcat';
import SelectByIndex from '../SelectByIndex';
import PropTypes from 'prop-types';
import onPropsChange from '../../onPropsChange';
// import withPropsOnChange from '../../withPropsOnChange';
// import dump from 'form-capacitor-util/dump';
import className from '../../className';
import {arraySplice} from '../../util';
import {withPath} from '../../../../form-capacitor-state/src';
import field from '../../field';
// console.log(withValue);

export default createComponent({
    displayName: 'CheckBox',
    enhancers: [
        field({
            valueProp: 'checked',
            setValueProp: 'setChecked',
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
            },
        }),
        className(),
    ],
    propTypes: {
        multiple: PropTypes.bool,
        value: PropTypes.any,
        id: PropTypes.string,
        className: PropTypes.any,
    },
    render: ({id, path, multiple, checked, value, ...props}) => {
        if(!id) {
            if(multiple) {
                if(typeof value === 'string' || typeof value === 'number') {
                    id = `${path.join('.')}[${value}]`;
                }
            } else {
                id = path.join('.');
            }
        }
        if(checked) {
            if(multiple) {
                checked = checked.includes(value);
            } else {
                checked = true;
            }
        } else {
            checked = false;
        }
        // console.log('rneder checkbox');
        return (
            <input id={id} {...props} type="checkbox" checked={checked} />
        )
    }
})