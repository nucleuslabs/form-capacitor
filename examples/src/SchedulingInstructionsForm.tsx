import React from 'react';
import {connectForm, form} from 'form-capacitor';
import SchedulingInstruction from './SchedulingInstruction';
import {Button, Control, Field, Icon, SubmitButton, Title} from './bulma';
import {compose,withHandlers} from 'recompose';
import withHigherHandlers from './withHigherHandlers';
import {arraySplice} from './util';

interface Props {
    data: {
        instructions: object,
    }
}


const SchedulingInstructionsForm: React.SFC<Props> = ({data, addInstruction, onSubmit, deleteInstruction}) => {
    const {instructions} = data;

    return (
        <form onSubmit={onSubmit}>
            <Title>Scheduling Instructions</Title>
            <table className="table is-striped is-narrow is-fullwidth">
                <thead>
                    <tr>
                        <th></th>
                        <th>Appointment Type</th>
                        <th>Team</th>
                        <th>Discipline</th>
                        <th>Pref. Clinician</th>
                        <th>Pref. Time</th>
                        <th>Child Req'd?</th>
                    </tr>
                </thead>
                <tbody>
                    {instructions.length 
                        ? instructions.map((inst, i) =>
                            <SchedulingInstruction key={i} data={inst} name={`instructions.${i}`} remove={deleteInstruction(i)}/>) 
                        : <tr><td colSpan={7} className="has-text-centered">No instructions.</td></tr>
                    }
                </tbody>
            </table>
            <Field grouped>
                <Control>
                    <Button onClick={addInstruction}><Icon name="plus"/> Add Instruction</Button>
                </Control>
                <Control>
                    <SubmitButton><Icon name="floppy-o"/> Save</SubmitButton>
                </Control>
            </Field>
        </form>
    )
};

export default compose(
    form({
        name: 'schedulingInstructions',
        deserialize: d => d || {
            instructions: [],
        },
        dispatchProp: 'dispatch'
    }),
    withHandlers({
        addInstruction: ({dispatch}) => ev => {
            ev.preventDefault();
            dispatch('instructions', inst => [...inst, {}]);
        },
        onSubmit: ({data}) => ev => {
            ev.preventDefault();
            console.log('submit',data);
        }
    }),
    withHigherHandlers({
        deleteInstruction(index, {dispatch}, ev) {
            ev.preventDefault();
            dispatch('instructions', inst => arraySplice(inst, index));
        } 
    })
)(SchedulingInstructionsForm);
