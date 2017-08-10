import React from 'react';
import {connectForm, withSchema,field} from 'form-capacitor';
import {appointmentTypes, teams, disciplines, clinicians, times} from './options';
import SelectBox from './fields/SelectBox';
import CheckBox from './fields/CheckBox';
import {Icon} from './bulma';

function SchedulingInstruction({remove}) {
    return (
        <tr>
            <td>{remove ? <a href="" onClick={remove}><Icon name="trash"/></a> : null}</td>
            <td><SelectBox name="typeId" options={appointmentTypes}/></td>
            <td><SelectBox name="teamId" options={teams}/></td>
            <td><SelectBox name="disciplineId" options={disciplines}/></td>
            <td><SelectBox name="prefClinician" options={clinicians}/></td>
            <td><SelectBox name="prefTime" options={times}/></td>
            <td><CheckBox name="childRequired"/></td>
        </tr>
    )
}

export default field()(SchedulingInstruction);