const PropTypes = require('prop-types');

export const anyChildren = PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
]);