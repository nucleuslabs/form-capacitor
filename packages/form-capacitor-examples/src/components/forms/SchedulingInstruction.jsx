import React from 'react';
import {Icon} from '../bulma';
import createComponent from '../../createComponent';
import {withValue,mount} from 'form-capacitor-state';
import {withHandlers, withState} from 'recompose';
import SelectBox from '../fields/SelectBox';
import Switch from '../fields/Switch';
import {isEqual} from 'lodash';

import {appointmentTypes, teams, disciplines, clinicians, times} from '../../options';
import VCenter from '../VCenter';


export default createComponent({
    displayName: "SchedulingInstructionsForm",
    enhancers: [
        mount({add: p => p.name}),
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
                <td className="vert-center"><VCenter><Switch name="childRequired" on="Yes" off="No"/></VCenter></td>
                <td className="vert-center">{remove ? <a href="" onClick={remove}><Icon name="trash" medium/></a> : null}</td>
            </tr>
        )
    }
});
