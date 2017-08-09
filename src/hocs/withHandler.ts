import {mapProps, withProps, InferableComponentEnhancerWithProps} from 'recompose';
import {ReactEventHandler, SyntheticEvent} from 'react';
import {AnyObject} from '../types/misc';


// const withHandler: InferableComponentEnhancerWithProps<TInner, TOutter> = (propName:string, handler: ReactEventHandler<any>) => mapProps(({dispatch, ...other}) => ({
//     ...other,
//     [propName]: ev => dispatch(handler(ev)),
// }));
//
// export default withHandler;

export type EventHandler = (event: SyntheticEvent<any>, props: AnyObject) => void;

// export default function withHandler(propName: string, handler: EventHandler) {
//     return mapProps(({dispatch, ...other}) => ({
//         ...other,
//         [propName]: ev => dispatch(handler(ev, other)),
//     }))
// }

export default function withHandler({event = 'onChange', handler, removeDispatch=true, dispatchProp='dispatch'}: {event: string, handler:EventHandler, removeDispatch: boolean, dispatchProp: string}) {
    return mapProps(({[dispatchProp]: dispatch, ...other}) => {
        let ret = {
            ...other,
            [event]: ev => dispatch(handler(ev, other)),
        };
        
        if(!removeDispatch) {
            ret[dispatchProp] = dispatch;
        }
        
        return ret;
    })
}