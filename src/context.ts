import PropTypes from 'prop-types';
import {EMPTY_ARRAY} from './constants';
import {ValidationMap} from 'react';

export const ContextPath = 'SECRET_FORM_CAPACITOR_PATH';

export const contextTypes = {
    [ContextPath]: PropTypes.arrayOf(PropTypes.string),
};

export function getPath(props) {
    return props[ContextPath] || EMPTY_ARRAY;
}

export type ContextType = ValidationMap<{
    string: string[],
}>;