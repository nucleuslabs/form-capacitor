import React from 'react';
import {connectForm, withSchema,field} from 'form-capacitor';

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

export default field()(SchedulingInstruction);