import React from 'react';
import {connectForm, form} from 'form-capacitor';
import SchedulingInstruction from './SchedulingInstruction';
import {Button, Icon, SubmitButton, Title} from './bulma';
import {compose,withHandlers} from 'recompose';

interface Props {
    data: {
        instructions: object,
    }
}


const SchedulingInstructionsForm: React.SFC<Props> = ({data, addInstruction, onSubmit}) => {
    const {instructions} = data;

    return (
        <form onSubmit={onSubmit}>
            <Title>Scheduling Instructions</Title>
            <table className="table is-striped is-narrow is-fullwidth">
                <thead>
                    <tr>
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
                            <SchedulingInstruction key={i} data={inst} name={`instructions.${i}`}/>) 
                        : <SchedulingInstruction name="instructions.0"/>
                    }
                </tbody>
            </table>
            <Button onClick={addInstruction}><Icon name="plus"/> Add Instruction</Button>
            <SubmitButton><Icon name="floppy-o"/> Save</SubmitButton>
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
    })
)(SchedulingInstructionsForm);
