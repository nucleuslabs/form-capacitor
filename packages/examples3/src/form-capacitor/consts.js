import PropTypes from 'prop-types';

export const STORE_KEY = '_fcStore';
export const ERRORS_KEY = '_fcErrors';
export const PATH_KEY = '_fcPath';

export const CTX_TYPES = {
    [STORE_KEY]: PropTypes.any,
    [ERRORS_KEY]: PropTypes.any,
    [PATH_KEY]: PropTypes.array,
}