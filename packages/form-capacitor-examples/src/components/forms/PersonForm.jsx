import React from 'react';
import {
    CheckBoxLabel, Control, SingleField, FieldLabel, FieldRow, Title1, RadioLabel, SubmitButton, Button,
    Title2, Title, Buttons
} from '../bulma';
import TextBox from '../fields/TextBox';
import createComponent from '../../createComponent';
import {withValue} from 'form-capacitor-state';
import {dirtyProvider} from 'form-capacitor-dirty';
import {withHandlers} from 'recompact';
import DirtyLabel from '../fields/DirtyLabel';
import NumberBox from '../fields/NumberBox';

export default createComponent({
    displayName: "PersonForm",
    enhancers: [
        withValue({
            defaultValue: {
                name: "Mark",
                favNum: null
            },
            valueProp: 'formData'
        }), // try with {name: 'person'}
        dirtyProvider({
            resetStateProp: 'resetState',
            saveStateProp: 'saveState',
        }),
        withHandlers({
            resetState: props => ev => {
                ev.preventDefault();
                props.resetState();
            },
            saveState: props => ev => {
                ev.preventDefault();
                props.saveState();
            },
        })
    ],
    render: ({saveState, resetState, formData}) => {
        // console.log('render',formData);
        return (
            <div>
                <form>
                    <Title>Person Form</Title>
                    <FieldRow>
                        <DirtyLabel normal name="name">Name</DirtyLabel>
                        <SingleField>
                            <TextBox name="name"/>
                        </SingleField>
                    </FieldRow>
                    <FieldRow>
                        <DirtyLabel normal name="favNum">Favourite Number</DirtyLabel>
                        <SingleField narrow>
                            <NumberBox name="favNum"/>
                        </SingleField>
                    </FieldRow>
                    <FieldRow>
                        <FieldLabel/>
                        <SingleField>
                            <Buttons>
                                <Button onClick={saveState} primary>Save</Button>
                                <Button onClick={resetState}>Reset</Button>
                            </Buttons>
                        </SingleField>
                    </FieldRow>
                </form>
                <pre style={{marginTop: '10px'}}>
                    <code>
                        {JSON.stringify(formData, null, 2)}
                    </code>
                </pre>
            </div>
        )
    }
});
