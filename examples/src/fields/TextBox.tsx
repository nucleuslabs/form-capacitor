import React from 'react';
import {compose} from 'recompose';
import {connectField, withSchema, inputChanged, withHandler} from 'form-capacitor';
// import {JsonSchema} from '../../../src/types/json-schema';
// import {DispatchFn} from '../../../src/types/misc';
// import withHandler from '../../../src/hocs/withHandler';

export interface TextBoxProps extends React.InputHTMLAttributes<HTMLInputElement>{
    // dispatch: DispatchFn,
    // value: string,
    // name: string,
}

export function TextBox({dispatch, ...attrs}: TextBoxProps) {
    return <input type="text" onChange={ev => dispatch(ev.target.value)} className="form-control" {...attrs}/>
}

export default compose(
    connectField({

    }),
    // withDispatcher({
    //     propName: 'onChange',
    //     handler: ({dispatch,name}) => ev => dispatch(name, ev.target.value),
    // }),
    // withHandler('onChange', ({dispatch,name}) => ev => dispatch(name, ev.target.value)),
    withSchema({
        type: "string",
    })
)(TextBox);

