const React = require('react');
const {PropTypes} = React;
const { connect, connectAdvanced } = require('react-redux');
const util = require('./util');
const _ = require('lodash');
const {compose, mapProps, getContext} = require('recompose');
const namespace = require('./namespace');
const actions = require('./actionCreators');

function mapStateToProps(state, props) {
    return {
        data: _.get(state, [namespace, props.formId, 'data'], {}),
    };
}

function mapDispatchToProps(dispatch, {formId}) {
    return {
        dispatchSubmit: () => {
            dispatch(actions.submit(formId));
        },
    };
}

function connectForm() {
    return compose(
        getContext({form: PropTypes.object}),
        mapProps(props => {
            const form = props.form || {};
            return Object.assign(
                {
                    id: form.id
                },
                _.omit(props, ['form']),
            );
        }),
        connect(mapStateToProps, mapDispatchToProps)
    );
}


module.exports = connectForm;