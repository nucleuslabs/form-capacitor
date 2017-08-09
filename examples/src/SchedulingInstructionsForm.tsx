import React from 'react';
import {connectForm, form} from 'form-capacitor';
import SchedulingInstruction from './SchedulingInstruction';
import {Title} from './bulma';


interface Props {
    data: {
        instructions: object,
    }
}


const SchedulingInstructionsForm: React.SFC<Props> = ({data}) => {
    const {instructions} = data;

    return (
        <div>
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
                            <SchedulingInstruction key={inst.id} data={inst} name={`instructions.${i}`}/>) 
                        : <SchedulingInstruction name="instructions.0"/>
                    }
                </tbody>
            </table>
        </div>
    )
};

export default form({
    name: 'schedulingInstructions',
    deserialize: d => d || {
        instructions: [],
    }
})(SchedulingInstructionsForm);