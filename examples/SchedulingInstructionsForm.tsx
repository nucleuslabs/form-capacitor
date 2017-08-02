import React from 'react';
import {connectForm} from 'form-capacitor';
import SchedulingInstruction from './SchedulingInstruction';


interface Props extends FormProps {
    data: {
        instructions: Array<{
            id: string,
        }>
    }
}

class SchedulingInstructionsForm extends React.PureComponent<Props> {

    
    render() {
        const {data} = this.props;
        const {instructions} = data;
        
        return (
            <table>
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
                    {instructions.map((inst, i) => <SchedulingInstruction key={inst.id} data={inst} name={`instructions.${i}`}/>)}
                    <SchedulingInstruction key="*" name={`instructions.${instructions.length}`}/>
                </tbody>
            </table>
        )
    }
}

export default withSchema({
    type: 'object',
    properties: {
        instructions: {
            type: SchedulingInstruction,
            default: [],
        }
    }
})(SchedulingInstructionsForm);