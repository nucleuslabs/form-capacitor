import React from 'react';
import {
    CheckBoxLabel, Control, SingleField, FieldLabel, FieldRow, Title1, RadioLabel, SubmitButton,
    Title2, Title
} from '../bulma';
import TextBox from '../fields/TextBox';

export default function PersonForm() {
    
    return (
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
}