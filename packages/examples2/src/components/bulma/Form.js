import React from 'react';
import css from 'bulma/bulma.sass';
import cc from 'classcat';
import {withClass, withProps} from '../../lib/react';

// https://bulma.io/documentation/form/general/

export const Label = withClass('label',css.label)
export const Field = withClass('div',css.field, {
    horizontal: css['is-horizontal'],
});
export const FieldLabel = withClass('div',css['field-label'], {
    normal: css['is-normal'],
})
export const FieldBody = withClass('div',css['field-body'])
export const Control = withClass('div',css.control, {
    expanded: css.expanded,
    iconsLeft: css['has-icons-left'],
    iconsRight: css['has-icons-right'],
})
export const Input = withClass('input',css.input)
export const InputText = withProps(Input,{type:'text'});
export const TextArea = withClass('input',css.textarea)
export const HelpText = withClass('p',css.help)
export const Button = withClass('button',css.button)

export function Select({className,style,...props}) {
    return <div className={cc([css.select,className])}><select {...props}/></div>
}

export function Checkbox({className,style,children,...props}) {
    return <label className={cc([css.checkbox,className])}><input type="checkbox" {...props} />{children}</label>;
}

export function Radio({className,style,children,...props}) {
    return <label className={cc([css.radio,className])}><input type="radio" {...props} />{children}</label>;
}