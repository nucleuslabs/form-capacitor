import {mapProps, withProps} from 'recompose';
import {ChangeEvent, ChangeEventHandler, EventHandler, ReactEventHandler, SyntheticEvent} from 'react';
import {DispatchFn} from '../types/misc';
import {inputChanged} from '../eventHandlers';


export default function withHandler(propName='onChange', handler: ReactEventHandler<any>=inputChanged) {
    return mapProps(({dispatch, ...other}) => ({
        ...other,
        [propName]: ev => dispatch(handler(ev)),
    }))
}