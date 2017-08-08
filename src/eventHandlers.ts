import {DispatchFn} from './types/misc';
import {SyntheticEvent} from 'react';

// export const inputChanged = (dispatch: DispatchFn, name: string) => (ev: React.ChangeEvent<HTMLInputElement>) => dispatch(name, ev.target.value);

export function inputChanged(ev: React.ChangeEvent<HTMLInputElement>) {
    return ev.currentTarget.value;
}

export function valueAsNumber(ev: React.ChangeEvent<HTMLInputElement>) {
    return ev.currentTarget.valueAsNumber;
}

export function valueAsDate(ev: React.ChangeEvent<HTMLInputElement>) {
    return ev.currentTarget.valueAsDate;
}

/**
 * Converts a <input type="datetime-local"> to a Date object.
 *     
 * @param {React.ChangeEvent<HTMLInputElement>} ev
 * @returns {Date}
 */
export function datetime(ev: React.ChangeEvent<HTMLInputElement>) {
    return new Date(ev.currentTarget.valueAsNumber);
}

export function checkboxChanged(ev: React.ChangeEvent<HTMLInputElement>) {
    return ev.currentTarget.checked;
}

// FIXME: need to incorporate "name" somehow.....
// TODO: add more for <select> and arrays of checkboxes, radio buttons and such