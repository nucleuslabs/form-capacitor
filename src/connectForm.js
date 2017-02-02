const React = require('react');
const {PropTypes} = React;
const {connect, connectAdvanced} = require('react-redux');
const util = require('./util');
const _ = require('lodash');
const {compose, mapProps, getContext, withContext, lifecycle} = require('recompose');
const namespace = require('./namespace');
const actions = require('./actionCreators');
const ShortId = require('shortid');
const { createSelector,defaultMemoize } = require('reselect');
const shallowEqual = require('./shallowEqual');
const {emptyObject, emptyArray} = require('./consts');

const stateGetter = (s,p) => _.get(s, [namespace, p.id], emptyObject);

function mapDispatchToProps(dispatch, form) {
    // TODO: add setInput
    return {
        validate: () => { // FIXME: not sure if this should trigger a submit or not....
            dispatch(actions.submit(form.id));
            return Array.from(form.fields.values()).every(f => f.props.ui.isValid);
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
                    rules: rules ? util.unflatten(rules) : emptyObject,
                    fields: new Map(),
                },
            })
        ),
        getContext(contextTypes),
        // connect(mapStateToProps, mapDispatchToProps),
        connectAdvanced(selectorFactory)
    );
}



function selectorFactory(dispatch, factoryOptions) {
    const dataSelector = createSelector(stateGetter, state => _.get(state, 'data', emptyObject));
    let dispatchSelector = defaultMemoize(mapDispatchToProps);
    let prevProps = {};
    
    return (state, props) => {
        let nextProps = {
            data: dataSelector(state, props),
            ...dispatchSelector(dispatch, props.form),
            ...props,
        };

        if(shallowEqual(prevProps, nextProps)) {
            return prevProps;
        }

        return prevProps = nextProps;
    }
}

module.exports = connectForm;