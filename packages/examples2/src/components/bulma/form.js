import React from 'react';
import PropTypes from 'prop-types';
import css from './bulma.scss';
import cc from 'classcat';
import {classFactory, withClass, withProps} from '../../lib/react';
import shortid from 'shortid';
import commonModifiers from './modifiers'

// https://bulma.io/documentation/form/general/

export const Label = withClass('label',css.label)
export const Field = withClass('div',css.field, {
    isHorizontal: css['is-horizontal'],
    isExpanded: css['is-expanded'],
    hasAddons: css['has-addons'],
    isNarrow: css['is-narrow'],
});
export const FieldLabel = withClass('div',css['field-label'], {
    isNormal: css['is-normal'],
})
export const FieldBody = withClass('div',css['field-body'])
export const Control = withClass('div',css.control, {
    isExpanded: css['is-expanded'],
    hasIconsLeft: css['has-icons-left'],
    hasIconsRight: css['has-icons-right'],
})
export const Input = withClass('input',css.input,{
    ...commonModifiers,
})
export const InputText = withProps(Input,{type:'text'});
export const InputTel = withProps(Input,{type:'tel'});
export const TextArea = withClass('textarea',css.textarea)
export const HelpText = withClass('p',css.help, commonModifiers)
export const Button = withClass('button',css.button, {
    isStatic: css['is-static'],
    isInverted: css['is-inverted'],
    ...commonModifiers,
})


const selectFactory = classFactory(css.select, {
    isFullwidth: css['is-fullwidth'],
});

export function Select({className,style,isFullwidth,...props}) {
    return <div {...selectFactory({className,style,isFullwidth})}><select {...props}/></div>
}

export function Checkbox({className,style,children,...props}) {
    return <label className={cc([css.checkbox,className])}><input type="checkbox" {...props} />{children}</label>;
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