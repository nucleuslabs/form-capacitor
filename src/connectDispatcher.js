const React = require('react');
const {PropTypes} = React;
const { connect, connectAdvanced } = require('react-redux');
const util = require('./util');
const _ = require('lodash');
const {compose, mapProps, getContext} = require('recompose');
const namespace = require('./namespace');

// TODO: you can't get the form data for submission with this...
function connectDispatcher() {
    return compose(
        getContext({form: PropTypes.object}),
        mapProps(props => {
            const form = props.form || {};
            return Object.assign(
                {
                    formId: form.id
                },
                _.omit(props, ['form'])
            );
        }),
        connect(null, require('./mapDispatchToProps'))
    );
}


module.exports = connectDispatcher;