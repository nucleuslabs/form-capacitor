import React from 'react';
import {compose} from 'recompose';
import {withValueDispatch, withSchema, inputChanged, withHandler} from 'form-capacitor';
import field from '../../../src/hocs/field';
// import {JsonSchema} from '../../../src/types/json-schema';
// import {DispatchFn} from '../../../src/types/misc';
// import withHandler from '../../../src/hocs/withHandler';

// export interface TextBoxProps extends React.InputHTMLAttributes<HTMLInputElement>{
    // dispatch: DispatchFn,
    // value: string,
    // name: string,
// }

export type TextBoxProps = React.InputHTMLAttributes<HTMLInputElement>;

export function TextBox(attrs: TextBoxProps) {
    return <input className="form-control" {...attrs}/>
}

export default field({
    eventHandler: inputChanged,
})(TextBox);

// export default compose(
//     withValueDispatch(), // TODO: bake withHandler into connectField() too?
//     withHandler(),
// )(TextBox) as React.ComponentType<TextBoxProps & {name: string}>;

// export default connectField<TextBoxProps>()(TextBox);

// export default compose(
//     connectField({
//
//     }),
//     // withDispatcher({
//     //     propName: 'onChange',
//     //     handler: ({dispatch,name}) => ev => dispatch(name, ev.target.value),
//     // }),
//     // withHandler('onChange', ({dispatch,name}) => ev => dispatch(name, ev.target.value)),
//     withSchema({
//         type: "string",
//     })
// )(TextBox);
//
