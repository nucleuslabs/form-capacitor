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

function mapDispatchToProps(dispatch, {id,form}) {
    return {
        // TODO: rename to validate() and return true or false
        dispatchSubmit: () => {
            
            
            // console.log(Array.from(fields));
            let isValid = Array.from(form.fields.values()).every(f => f.props.ui.isValid);
            
            console.log('form is valid',isValid);
            
            dispatch(actions.submit(id));
        },
    };
}

const contextTypes = {
    form: PropTypes.object,
};

function connectForm({rules}) {
    return compose(
        withContext(
            contextTypes,
            props => ({
                form: {
                    id: props.id || ShortId.generate(),
                    rules: rules ? util.unflatten(rules) : {},
                    fields: new Map(),
                },
            })
        ),
        getContext(contextTypes),
        // mapProps(props => Object.assign({
        //     fields: props.form.fields,
        //    
        // },_.omit(props,['form']))),
        connect(mapStateToProps, mapDispatchToProps)
    );
}


module.exports = connectForm;