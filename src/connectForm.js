const React = require('react');
const {PropTypes} = React;
const {connect, connectAdvanced} = require('react-redux');
const util = require('./util');
const _ = require('lodash');
const {compose, mapProps, getContext, withContext} = require('recompose');
const namespace = require('./namespace');
const actions = require('./actionCreators');
const ShortId = require('shortid');

function mapStateToProps(state, props) {
    return {
        data: _.get(state, [namespace, props.id, 'data'], {}), // TODO: get default values in here somehow
    };
}

function mapDispatchToProps(dispatch, {id}) {
    return {
        // TODO: rename to validate() and return true or false
        dispatchSubmit: () => {
            dispatch(actions.submit(id));
        },
    };
}

function connectForm({rules}) {
    return compose(
        withContext(
            {
                form: PropTypes.object,
            },
            props => ({
                form: {
                    id: props.id || ShortId.generate(),
                    rules: rules ? util.unflatten(rules) : {},
                },
            })
        ),
        connect(mapStateToProps, mapDispatchToProps)
    );
}


module.exports = connectForm;