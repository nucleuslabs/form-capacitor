import React from 'react';
import {
    CheckBoxLabel, Control, SingleField, FieldLabel, FieldRow, Title1, RadioLabel, SubmitButton,
    Title2, Title
} from '../bulma';
import TextBox from '../fields/TextBox';
import createComponent from '../../createComponent';
import {withValue} from 'form-capacitor-store';

export default createComponent({
    displayName: "PersonForm",
    enhancers: [
        withValue() // try with {name: 'person'}
    ],
    render: () => (
        <form>
            <Title>Person Form</Title>
            <FieldRow>
                <FieldLabel normal>Name</FieldLabel>
                <SingleField>
                    <TextBox name="name" />
                </SingleField>
            </FieldRow>
        </form>
    )
});
