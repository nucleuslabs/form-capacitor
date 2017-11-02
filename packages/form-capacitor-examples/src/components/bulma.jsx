import React from 'react';
import cc from 'classcat';

export const FieldRow = ({children}) => (
    <div className="field is-horizontal">
        {children}
    </div>
);

export const FieldLabel = ({children=null,normal=false,className,htmlFor}) => (
    <div className={cc(['field-label',{'is-normal':normal},className])}>
        {children ? <label className="label" htmlFor={htmlFor}>{children}</label> : null}
    </div>
);

export const Field = ({children, narrow=false, grouped=false, horizontal=false}) => (
    <div className={cc(['field',{'is-narrow':narrow,'is-grouped':grouped,'is-horizontal':horizontal}])}>
        {children}
    </div>
);

export const FieldBody = ({children}) => (
    <div className="field-body">
        {children}
    </div>
);

export const SingleField = ({children, narrow=false, horizontal=false}) => (
    <FieldBody>
        <Field narrow={narrow} horizontal={horizontal}>{children}</Field>
    </FieldBody>
);

export const Buttons = props => <div {...props} className="buttons" />;

export const Button = ({children, primary, info, type, success, warning, danger, link, outlined, inverted, loading, className, ...attrs}) => (
    <button {...attrs} type={type} className={cc(['button', {
        'is-primary': primary,
        'is-info': info,
        'is-success': success,
        'is-warning': warning,
        'is-danger': danger,
        'is-link': link,
        'is-outlined': outlined,
        'is-inverted': inverted,
        'is-loading': loading,
    }, className])}>
        {children}
    </button>
);

export const SubmitButton = ({children}) => (
    <Button type="submit" primary children={children}/>
);

export const Control = ({children}) => (
    <div className="control">
        {children}
    </div>
);

export const RadioLabel = ({children}) => (
    <label className="radio">{children}</label>
);

export const CheckBoxLabel = ({children}) => (
    <label className="checkbox">{children}</label>
);

export const Title = ({children}) => (
    <h1 className="title">{children}</h1>

);

const H = ({children,level}) => (
    React.createElement(`h${level}`,{className: `title is-${level}`},children)
);

export const Title1 = ({children}) => (
    <H level={1}>{children}</H>
);

export const Title2 = ({children}) => (
    <H level={2}>{children}</H>
);

export const Title3 = ({children}) => (
    <H level={3}>{children}</H>
);

export const Icon = ({name, small, medium, large}) => (
    <span className="icon">
        <i className={[cc('fa', `fa-${name}`, {
            'is-small': small,
            'is-medium': medium,
            'is-large': large,
        })]}/>
    </span>
);