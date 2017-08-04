import {Action as ReduxAction, AnyAction, Reducer, Store, StoreEnhancer} from 'redux';
import ActionTypes from '../ActionTypes';
// interface FormProps {
//     data: any,
// }




export type MapFn<T, U> = (input: T) => U;

export type DispatchFn = (value: any) => void;

declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION__?: Function
    }
}

export interface AnyObject {
    [x: string]: any
}

export interface Action<T=AnyObject> extends ReduxAction {
    type: ActionTypes,
    payload: T;
    error?: boolean;
}

export interface ErrorAction extends Action<Error> {
    error: true;
}