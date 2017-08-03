import {connectForm, withSchema} from 'form-capacitor';

function SchedulingInstruction() {
    
    return (
        <tr>
            <td><select name="typeId"/></td>
            <td><select name="teamId"/></td>
            <td><select name="disciplineId"/></td>
            <td><select name="prefClinician"/></td>
            <td><select name="prefTime"/></td>
            <td><input type="checkbox" name="childRequired"/></td>
        </tr>
    )
}

export default withSchema({
    type: 'object',
    properties: {
        typeId: {type: 'integer'},
        teamId: {type: 'integer'},
        disciplineId: {type: 'integer'},
        clinicianId: {type: 'integer'},
        prefTime: {type: 'integer'},
        childRequired: {type: 'string'},
    }
})(SchedulingInstruction);