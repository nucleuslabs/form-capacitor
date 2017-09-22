import React from 'react';
import TextBox from './fields/TextBox';
import {mountPoint,form} from 'form-capacitor';
import NumberBox from './fields/NumberBox';
import DatePicker from './fields/DatePicker';
import CheckBox from './fields/CheckBox';
import RadioButton from './fields/RadioButton';
import SelectBox from './fields/SelectBox';
import {formatDate} from './util';
import {
    CheckBoxLabel, Control, SingleField, FieldLabel, FieldRow, Title1, RadioLabel, SubmitButton,
    Title2, Title, FieldBody, Field
} from './bulma';

import {languages,pleaseSelect} from './options';
import {compose, withHandlers} from 'recompose';
import withSchema from '../../src/hocs/withSchema';
import withValue from '../../src/hocs/withValue';
import * as Types from './SchemaTypes';
import PasswordBox from './fields/PasswordBox';
import pmemoize from 'p-memoize';

export interface GithubFormProps {

}


const primaryLanguages = [pleaseSelect, ...languages];



const GithubForm: React.SFC<GithubFormProps> = ({onSubmit}) => {

    return (
        <form onSubmit={onSubmit}>
            <Title>Async Validations</Title>
            <FieldRow>
                <FieldLabel normal>Github Username</FieldLabel>
                <SingleField>
                    <TextBox name="username" />
                </SingleField>
            </FieldRow>
            <FieldRow>
                <FieldLabel normal>Favourite <a href="https://scrolls.com/" target="_blank">Scroll</a></FieldLabel>
                <SingleField>
                    <TextBox name="scroll" />
                </SingleField>
            </FieldRow>
            <FieldRow>
                <FieldLabel/>
                <SingleField>
                    <SubmitButton>Submit</SubmitButton>
                </SingleField>
            </FieldRow>
        </form>
    )
};
// export default GithubForm;

// https://runkit.com/esp/ajv-asynchronous-validation

const mem = fn => pmemoize(fn, {maxAge: 1000*60*5});

const githubUsernameAvailable = mem(username => fetch(`https://api.github.com/users/${encodeURIComponent(username)}`).then(res => res.status === 404));

// http://a.scrollsguide.com/docs/
const scrolls = mem(name => fetch(`http://a.scrollsguide.com/scrolls?name=${encodeURIComponent(name)}`).then(res => res.json()).then(json => json.msg === 'success'));

export default compose(
    withValue({
        nameProp: 'name',
        valueProp: 'value',
    }),
    withSchema({
        schema: Types.requiredObject({
            $async: true,
            properties: {
                username: Types.string({
                    minLength: 4,
                    if: {
                        minLength: 4,
                    },
                    then: {
                        format: 'github'
                    }
                }),
                scroll: Types.string({
                    minLength: 3,
                    if: {
                        minLength: 3,
                    },
                    then: {
                        format: 'scroll'
                    }
                }),
            },
        }),
        formats: {
            github: {
                async: true,
                validate: githubUsernameAvailable,
                // validate: async username => true,
            },
            scroll: {
                async: true,
                validate: scrolls,
                // validate: async username => true,
            }
        }
    }),
    withHandlers({
        onSubmit: props => ev => {
            ev.preventDefault();
            console.log(stringify(props.value))
        }
    }),
)(GithubForm);

function replacer(key, value) {
    if(value instanceof Set) {
        return Array.from(value);
    }
    return value;
}

function stringify(obj) {
    return JSON.stringify(obj,replacer,2);
}


