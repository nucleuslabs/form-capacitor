import React from 'react';
import classNames from 'classnames';

export const FieldRow = ({children}) => (
    <div className="field is-horizontal">
        {children}
    </div>
);

export const FieldLabel = ({children=null,normal=false}) => (
    <div className={classNames('field-label',{'is-normal':normal})}>
        {children ? <label className="label">{children}</label> : null}
    </div>
);

export const FieldBody = ({children, narrow=false}) => (
    <div className="field-body">
        <div className={classNames('field',{'is-narrow':narrow})}>
            {children}
        </div>
    </div>
);

export const SubmitButton = ({children}) => (
    <button type="submit" className="button is-primary">
        {children}
    </button>
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
