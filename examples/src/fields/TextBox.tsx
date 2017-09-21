import React from 'react';
import {compose, withPropsOnChange,pure,toClass} from 'recompose';
import {withValueDispatch, withSchema, inputChanged, withHandler} from 'form-capacitor';
import field from '../../../src/hocs/field';
import * as Types from '../SchemaTypes';
import withSchema from '../../../src/hocs/withSchema';
// import {JsonSchema} from '../../../src/types/json-schema';
// import {DispatchFn} from '../../../src/types/misc';
// import withHandler from '../../../src/hocs/withHandler';

// export interface TextBoxProps extends React.InputHTMLAttributes<HTMLInputElement>{
    // dispatch: DispatchFn,
    // value: string,
    // name: string,
// }

export type TextBoxProps = React.InputHTMLAttributes<HTMLInputElement>;

export function TextBox({path, name, ...attrs}: TextBoxProps) {
    return (
        <div className="control">
            <input className="input" {...attrs}/>
        </div>
    )
}


export default compose(
    field({
        eventHandler: inputChanged,
    }),
    withSchema({
        schema: Types.string()
    }),
    withPropsOnChange(['value'], ({value}) => {
        if(value === undefined) {
            return {value:''};
        }
    })
)(TextBox);

// export default field({
//     eventHandler: inputChanged,
// })(TextBox);

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
