const PropTypes = require('prop-types');

exports.anyChildren = PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
]);