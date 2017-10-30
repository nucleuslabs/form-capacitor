import PropTypes from 'prop-types';
import {EMPTY_ARRAY} from './constants';

export const ContextPath = 'SECRET_FORM_CAPACITOR_PATH';
export const ContextStore = 'SECRET_FORM_CAPACITOR_STORE';
export const StoreShape = PropTypes.object;
export const PathShape = PropTypes.arrayOf(PropTypes.string);

export const contextTypes = {
    [ContextPath]: PathShape,
    [ContextStore]: StoreShape,
};

export function getPath(props) {
    return props[ContextPath] || EMPTY_ARRAY;
}
