import React from 'react';
import {
    CheckBoxLabel, Control, SingleField, FieldLabel, FieldRow, Title1, RadioLabel, SubmitButton, Button,
    Title2, Title
} from '../bulma';
import TextBox from '../fields/TextBox';
import createComponent from '../../createComponent';
import {withValue} from 'form-capacitor-state';
import {dirtyProvider} from 'form-capacitor-dirty';
import {withHandlers} from 'recompact';

export default createComponent({
    displayName: "PersonForm",
    enhancers: [
        withValue({
            defaultValue: {
                name: "Mark"
            },
            valueProp: 'formData'
        }), // try with {name: 'person'}
        dirtyProvider({
            resetStateProp: 'resetState'
        }),
        withHandlers({
            resetState: props => ev => {
                ev.preventDefault();
                props.resetState();
            }
        })
    ],
    render: ({resetState, formData}) => {
        // console.log('render',formData);
        return (
            <div>
                <form>
                    <Title>Person Form</Title>
                    <FieldRow>
                        <FieldLabel normal>Name</FieldLabel>
                        <SingleField>
                            <TextBox name="name"/>
                        </SingleField>
                    </FieldRow>
                    <FieldRow>
                        <FieldLabel/>
                        <SingleField>
                            <Button onClick={resetState}>Reset</Button>
                        </SingleField>
                    </FieldRow>
                </form>
                <pre>
                <code>
                    {JSON.stringify(formData, null, 2)}
                </code>
            </pre>
            </div>
        )
    }
});
