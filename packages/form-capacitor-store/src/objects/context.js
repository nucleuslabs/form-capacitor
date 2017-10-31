import PropTypes from 'prop-types';
import {EMPTY_ARRAY} from '../../../form-capacitor-state/src/constants';

export const ContextPath = 'SECRET_FORM_CAPACITOR_PATH';
export const ContextStore = 'SECRET_FORM_CAPACITOR_STORE';
// export const ContextDirty = 'SECRET_FORM_CAPACITOR_DIRTY';
export const StoreShape = PropTypes.object;
export const PathShape = PropTypes.arrayOf(PropTypes.string);
// export const DirtyShape = StoreShape;

export const contextTypes = {
    [ContextPath]: PathShape,
    [ContextStore]: StoreShape,
};

export function getPath(props) {
    return props[ContextPath] || EMPTY_ARRAY;
}

export const DATA_ROOT = 'data';

/**
 * Initial form state. Used for dirty checks and to allow resetting the form.
 * @type {string}
 */
export const DIRTY_ROOT = 'init';