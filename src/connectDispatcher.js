const React = require('react');
const PropTypes = require('prop-types');
const {connect} = require('react-redux');
const {compose, getContext} = require('recompose');

// TODO: you can't get the form data for submission with this...
function connectDispatcher() {
    return compose(
        getContext({form: PropTypes.object}),
        // mapProps(props => {
        //     const form = props.form || {};
        //     return Object.assign(
        //         {
        //             formId: form.id
        //         },
        //         _.omit(props, ['form'])
        //     );
        // }),
        connect(null, require('./mapDispatchToProps'))
    );
}


module.exports = connectDispatcher;