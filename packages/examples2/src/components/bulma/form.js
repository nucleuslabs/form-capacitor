import React from 'react';
import PropTypes from 'prop-types';
import css from './bulma.scss';
import cc from 'classcat';
import {classFactory, withClass, withProps} from '../../lib/react';
import shortid from 'shortid';
import commonModifiers from './modifiers'
import elem from './factory';
// https://bulma.io/documentation/form/general/

export const Label = elem('label',css.label)
export const Field = elem('div',css.field, {
    isHorizontal: css['is-horizontal'],
    isExpanded: css['is-expanded'],
    hasAddons: css['has-addons'],
    isNarrow: css['is-narrow'],
});
export const FieldLabel = elem('div',css['field-label'], {
    isNormal: css['is-normal'],
})
export const FieldBody = elem('div',css['field-body'])
export const Control = elem('div',css.control, {
    isExpanded: css['is-expanded'],
    hasIconsLeft: css['has-icons-left'],
    hasIconsRight: css['has-icons-right'],
})
export const Input = elem('input',css.input)
export const InputText = withProps(Input,{type:'text'});
export const InputTel = withProps(Input,{type:'tel'});
export const TextArea = elem('textarea',css.textarea)
export const HelpText = elem('p',css.help, commonModifiers)
export const Button = elem('button',css.button, {
    isStatic: css['is-static'],
    isInverted: css['is-inverted'],
})

export function ButtonBar({children}) {
    return <div className={css.buttonBar}>{children}</div>;
}

export class ActionButton extends React.Component {

    clickHandler = ev => {
        ev.preventDefault();
        if(this.props.onClick) {
            this.props.onClick.call(this, ev)
        }
    }

    render() {
        return <Button {...this.props} onClick={this.clickHandler}/>
    }
}

const SelectWrap = elem('div',css.select, {
    isFullWidth: css['is-fullwidth'],
});

export function Select({value,onChange,children,placeholder,...props}) {
    return (
        <SelectWrap {...props}>
            <select {...{value,onChange}}>
                {placeholder != null && <option value="" disabled>{placeholder}</option>}
                {children}
            </select>
        </SelectWrap>
    )
}

export function Checkbox({className,style,children,...props}) {
    return <label className={cc([css.checkbox,className])}><input type="checkbox" {...props} /><span>{children}</span></label>;
}

const radioNameProp = shortid();

const radioContextTypes = {
    [radioNameProp]: PropTypes.string,
};

export class RadioMenu extends React.Component {
    static childContextTypes = radioContextTypes    
    getChildContext() {
        return {
            [radioNameProp]: this.props.name || shortid()
        }
    }
    
    render() {
        return this.props.children;
    }
}

export function Radio({className,style,children,name=ctx[radioNameProp],value=1,...props}, ctx) {
    return <label className={cc([css.radio,className])}><input type="radio" {...props} name={name} value={value}/><span>{children}</span></label>;
}

Radio.contextTypes = radioContextTypes