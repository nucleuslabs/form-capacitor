const util = require('./util');
const _ = require('lodash');
const getOr = require('lodash/fp/getOr');
const {toPath} = _;
const actionTypes = require('./actionTypes');
const { createSelector, defaultMemoize, createSelectorCreator } = require('reselect');
const namespace = require('./namespace');
const {isDependant,isAsync} = require('./specialRules');
const DeepMap = require('./DeepMap');

const defaultValueGetter = (_,p) => p.defaultValue;
// const formIdGetter = (_,p) => p.form.id;
const stateGetter = (s,p) => _.get(s, [namespace, p.form.id], {});


// const getIsDirty = createSelector([getValue, getInitialValue], _.isEqual);
// const getIsEmpty = createSelector([getValue, (_,props) => props.defaultValue], _.isEqual);
// const getIsValid = createSelector([getErrors], errors => errors.length === 0);

const ruleCache = new DeepMap();
const notFound = Symbol();

function getErrors(value, rules, defaultErrorMessage, defaultPendingMessage, ui, formData) {
    // TODO: how to support promises like in textInput.jsx?
    return rules.map(rule => {
        let fn, args;
        if(rule[isDependant]) {
            let deps = rule.fields.map(f => _.get(formData, f));
            fn = rule.rule;
            args = [value, ...deps, ui];
        } else {
            fn = rule;
            args = [value, ui];
        }
        let pendingMessage = defaultPendingMessage;
        if(fn[isAsync]) { // FIXME: what if this was wrapped in optional() ? then we wouldn't know it was async until invoked once -- maybe all rules should be objects with various flags?
            // also, maybe *all* rules except required() should be optional by default?
            pendingMessage = fn.message;
            fn = fn.rule;
        }
        let key = [fn, ...args.slice(0, fn.length)]; // FIXME: the slice is to lop off `ui` if it isn't used so that `ui` changes don't bust the cache, but this could be flakey
        let err = ruleCache.get(key,notFound);
        if(err === notFound) {
            err = fn(...args);
            ruleCache.set(key, err); // TODO: should we cache everything or just promises?
            if(err instanceof Promise) {
                err.then(val => {
                    // console.log('promise resolved',key,val);
                    ruleCache.set(key, val);
                }, () => {
                    // console.log('promise rejected',key);
                    ruleCache.delete(key);
                });
            }
        } 
        if(err instanceof Promise) {
            return pendingMessage;
        } else if(util.isNullish(err) || err === true) {
            return false;
        } else if(err === false) {
            return defaultErrorMessage;
        }
        return err;
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
    const errorSelector = util.createDeepEqualSelector([valueSelector, (_,p) => p.rules, (_,p) => p.defaultErrorMessage, (_,p) => p.defaultPendingMessage, stateUiSelector, dataGetter], getErrors);

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