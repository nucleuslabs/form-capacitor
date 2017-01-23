const React = require('react');
const {PropTypes} = React;
const { connect, connectAdvanced } = require('react-redux');
const util = require('./util');
const _ = require('lodash');
const {compose, mapProps, getContext} = require('recompose');
const namespace = require('./namespace');

function connectField() {
    return compose(
        getContext({form: PropTypes.object}),
        mapProps(props => {
            const form = props.form || {};
            const fieldRules = util.array(props.rules);
            const baseRules = form.rules ? util.array(util.glob(form.rules,props.name,[])) : [];
            return Object.assign(
                {
                    formId: form.id
                },
                _.omit(props, ['form']),
                {
                    rules: _.concat(baseRules, fieldRules),
                }
            );
        }),
        connect(require('./mapStateToProps'), require('./mapDispatchToProps'))
    );
}


module.exports = connectField;