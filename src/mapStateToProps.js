const util = require('./util');
const _ = require('lodash');
const getOr = require('lodash/fp/getOr');
const {toPath} = _;
const actionTypes = require('./actionTypes');
const { createSelector, defaultMemoize, createSelectorCreator } = require('reselect');
const namespace = require('./namespace');
const {isDependantRule} = require('./dependantRule');

const defaultValueGetter = (_,p) => p.defaultValue;
// const formIdGetter = (_,p) => p.form.id;
const stateGetter = (s,p) => _.get(s, [namespace, p.form.id], {});


// const getIsDirty = createSelector([getValue, getInitialValue], _.isEqual);
// const getIsEmpty = createSelector([getValue, (_,props) => props.defaultValue], _.isEqual);
// const getIsValid = createSelector([getErrors], errors => errors.length === 0);


function getErrors(value, rules, defaultMessage, ui, formData) {
    // TODO: how to support promises like in textInput.jsx?
    return rules.map(rule => {
        if(rule[isDependantRule]) {
            let deps = rule.fields.map(f => _.get(formData, f));
            return rule.rule(value, ...deps, ui);
        }
        return rule(value, ui);
    }).map(result => {
        if(util.isNullish(result) || result === true) {
            return false;
        } else if(result === false) {
            return defaultMessage;
        }
        return result;
    }).filter(x => x);
}


module.exports = function mapStateToProps() {
    const namePathSelector = createSelector((_, p) => p.name, toPath);
    const stateUiSelector = util.createDeepEqualSelector([stateGetter,namePathSelector], (state,np) => Object.assign({
        isFocused: false,
        isHovering: false,
        mouseEntered: false,
        mouseLeft: false,
        wasFocused: false,
        wasBlurred: false,
        wasChanged: false,
    }, _.get(state, ['ui', ...np], {})));
    const dataGetter = createSelector(stateGetter, getOr({},'data'));
    const valueSelector = createSelector([dataGetter,namePathSelector, defaultValueGetter], (data,np,dv) => _.get(data, np, dv));
    const initialGetter = createSelector(stateGetter, getOr({},'initial'));
    const initialValueSelector = createSelector([initialGetter,namePathSelector, defaultValueGetter], (init,np,dv) => _.get(init, np, dv));
    const errorSelector = util.createDeepEqualSelector([valueSelector, (_,p) => p.rules, (_,p) => p.defaultMessage, stateUiSelector, dataGetter], getErrors);

    const isDirtySelector = createSelector([valueSelector,initialValueSelector], (value,initialValue) => !_.isEqual(value, initialValue));
    const isValidSelector = createSelector(errorSelector, errors => errors.length === 0);
    const isEmptySelector = createSelector([valueSelector,defaultValueGetter], _.isEqual);
    const formValidatedSelector = createSelector(stateGetter, state => _.get(state, 'submit', 0) > 0);
    
    const uiSelector = util.createDeepEqualSelector([stateUiSelector,isDirtySelector,isValidSelector,isEmptySelector,formValidatedSelector], (ui,isDirty,isValid,isEmpty,formValidated) => ({
        isFocused: ui.isFocused,
        isHovering: ui.isHovering,
        mouseEntered: ui.mouseEntered,
        mouseLeft: ui.mouseLeft,
        wasFocused: ui.wasFocused,
        wasBlurred: ui.wasBlurred,
        wasChanged: ui.wasChanged,
        isDirty,
        isValid,
        isEmpty,
        formValidated,
    }));

    return (state, props) => ({
        value: valueSelector(state, props),
        errors: errorSelector(state, props),
        ui: uiSelector(state, props),
    });
};