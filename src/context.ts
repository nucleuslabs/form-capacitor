import PropTypes from 'prop-types';
import {EMPTY_ARRAY} from './constants';
import {ValidationMap} from 'react';

export const FIELD_PATH = '__secret_form_capacitor_path__';

export const contextTypes = {
    [FIELD_PATH]: PropTypes.arrayOf(PropTypes.string),
};

export function getPath(props) {
    return props[FIELD_PATH] || EMPTY_ARRAY;
}

export type ContextType = ValidationMap<{
    string: string[],
}>;