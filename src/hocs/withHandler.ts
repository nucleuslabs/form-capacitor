import {mapProps} from 'recompose';
import {ChangeEvent, ChangeEventHandler, SyntheticEvent} from 'react';
import {DispatchFn} from '../types/misc';
import {inputChanged} from '../eventHandlers';


export default function withHandler({propName='onChange', handler=inputChanged}: {propName: string, handler: (ev: React.ChangeEvent<HTMLInputElement>) => any}) {
    return mapProps(({name, dispatch, ...other}: {name: string, dispatch: DispatchFn}) => ({
        ...other,
        [propName]: (ev: React.ChangeEvent<HTMLInputElement>) => dispatch(name, handler(ev)),
    }))
}