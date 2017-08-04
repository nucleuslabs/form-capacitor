import {DispatchFn} from './types/misc';
import {SyntheticEvent} from 'react';

// export const inputChanged = (dispatch: DispatchFn, name: string) => (ev: React.ChangeEvent<HTMLInputElement>) => dispatch(name, ev.target.value);

export function inputChanged(ev: React.ChangeEvent<HTMLInputElement>) {
    return ev.currentTarget.value;
}

export function checkboxChanged(ev: React.ChangeEvent<HTMLInputElement>) {
    return ev.currentTarget.checked;
}

// FIXME: need to incorporate "name" somehow.....
// TODO: add more for <select> and arrays of checkboxes, radio buttons and such