import React from 'react';
import {Icon} from '../bulma';
import createComponent from '../../createComponent';
import {withValue,mountPoint} from 'form-capacitor-state';
import {withHandlers, withState} from 'recompact';
import SelectBox from '../fields/SelectBox';
import CheckBox from '../fields/CheckBox';
import {isEqual} from 'lodash';

import {appointmentTypes, teams, disciplines, clinicians, times} from '../../options';


export default createComponent({
    displayName: "SchedulingInstructionsForm",
    enhancers: [
        mountPoint({add: p => p.name}),
        // withValue(), 
    ],
    render: ({remove}) => {
        return (
            <tr>
                <td className="vert-center"><SelectBox name="typeId" options={appointmentTypes}/></td>
                <td className="vert-center"><SelectBox name="teamId" options={teams}/></td>
                <td className="vert-center"><SelectBox name="disciplineId" options={disciplines}/></td>
                <td className="vert-center"><SelectBox name="prefClinicianId" options={clinicians}/></td>
                <td className="vert-center"><SelectBox name="prefTime" options={times}/></td>
                <td className="vert-center"><CheckBox name="childRequired"/></td>
                <td className="vert-center">{remove ? <a href="" onClick={remove}><Icon name="trash" medium/></a> : null}</td>
            </tr>
        )
    }
});
