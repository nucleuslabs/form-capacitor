const React = require('react');
const {PropTypes} = React;
const { connect, connectAdvanced } = require('react-redux');
const util = require('./util');
const _ = require('lodash');
const {toPath} = _;
const actionTypes = require('./actionTypes');
const {fluxStandardAction} = require('./actionCreators');
const { createSelector } = require('reselect');
const {compose, mapProps, getContext} = require('recompose');
const namespace = require('./namespace');

const getValue = (state, props) => {
    return _.get(state, [namespace, props.formId, 'data', ...toPath(props.name)], props.defaultValue);
};

const getInitialValue = (state, props) => {
    return _.get(state, [namespace, props.formId, 'initial', ...toPath(props.name)], props.defaultValue);
};

const getIsFocused = (state, props) => {
    return _.get(state, [namespace, props.formId, 'ui', ...toPath(props.name), 'isFocused'], false);
};
const getWasFocused = (state, props) => {
    return _.get(state, [namespace, props.formId, 'ui', ...toPath(props.name), 'wasFocused'], false);
};
const getIsHovering = (state, props) => {
    return _.get(state, [namespace, props.formId, 'ui', ...toPath(props.name), 'isHovering'], false);
};
const getRules = (state, props) => {
    return util.array(props.rules);
};

const getDefaultMessage = (state, props) => {
    return props.defaultMessage;
};

const getErrors = createSelector([getValue, getRules, getDefaultMessage], (value, rules, defaultMessage) => {
    // if(!touched) return [];

    let meta = {
        // wasFocused
    };

    // TODO: how to support promises like in textInput.jsx?
    return rules.map(rule => rule(value, meta)).map(result => {
        if(util.isNullish(result) || result === true) {
            return false;
        } else if(result === false) {
            return defaultMessage;
        }
        return result;
    }).filter(x => x);
});

const getIsDirty = createSelector([getValue, getInitialValue], _.isEqual);
const getIsEmpty = createSelector([getValue, (_,props) => props.defaultValue], _.isEqual);
const getIsValid = createSelector([getErrors], errors => errors.length === 0);

const mapStateToProps = (state, props) => {
    let value = getValue(state, props);
    let initialValue = getInitialValue(state, props);
    let errors = getErrors(state, props);

    let ui = {
        isDirty: !_.isEqual(value, initialValue),
        isValid: errors.length === 0,
        isEmpty: _.isEqual(value, props.defaultValue),
        isFocused: _.get(state, [namespace, props.formId, 'ui', ...toPath(props.name), 'isFocused'], false),
        isHovering: _.get(state, [namespace, props.formId, 'ui', ...toPath(props.name), 'isHovering'], false),
        mouseEntered: _.get(state, [namespace, props.formId, 'ui', ...toPath(props.name), 'mouseEntered'], false),
        mouseLeft: _.get(state, [namespace, props.formId, 'ui', ...toPath(props.name), 'mouseLeft'], false),
        wasFocused: _.get(state, [namespace, props.formId, 'ui', ...toPath(props.name), 'wasFocused'], false),
        wasBlurred: _.get(state, [namespace, props.formId, 'ui', ...toPath(props.name), 'wasBlurred'], false),
        wasChanged: _.get(state, [namespace, props.formId, 'ui', ...toPath(props.name), 'wasChanged'], false),
    };

    return {value,ui,errors};
};

const mapDispatchToProps = (dispatch, {formId,name}) => {
    return {
        dispatch: (actionType, payload) => {
            dispatch(fluxStandardAction(actionType, Object.assign({}, payload, {formId,name})));
        }
    };
};

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
        connect(mapStateToProps, mapDispatchToProps)
    );
}


module.exports = connectField;