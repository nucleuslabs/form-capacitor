const {PropTypes} = require('react');

exports.anyChildren = PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
]);