const util = require('./util');
const _ = require('lodash');
const {toPath} = _;
const actionTypes = require('./actionTypes');
const { createSelector } = require('reselect');
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


module.exports = function mapStateToProps(state, props) {
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
        wasSubmitted: _.get(state, [namespace, props.formId, 'submitted'], false),
    };

    return {value,ui,errors};
};