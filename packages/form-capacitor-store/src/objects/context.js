import PropTypes from 'prop-types';
// import {EMPTY_ARRAY} from '../../../form-capacitor-state/src/constants';

export const CTX_KEY_PATH = '__FC_PATH__';
// export const ContextStore = 'SECRET_FORM_CAPACITOR_STORE';
// export const ContextDirty = 'SECRET_FORM_CAPACITOR_DIRTY';
// export const StoreShape = PropTypes.object;
export const CTX_VAL_PATH = PropTypes.arrayOf(PropTypes.string);
// export const DirtyShape = StoreShape;

// export const contextTypes = {
//     [CTX_KEY_PATH]: PathShape,
//     // [ContextStore]: StoreShape,
// };

// export function getPath(props) {
//     return props[CTX_KEY_PATH] || EMPTY_ARRAY;
// }

export const DATA_ROOT = 'data';

/**
 * Initial form state. Used for dirty checks and to allow resetting the form.
 * @type {string}
 */
export const INIT_ROOT = 'init';

export const ERROR_ROOT = 'errors';