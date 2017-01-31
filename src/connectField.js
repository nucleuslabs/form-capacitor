const React = require('react');
const {PropTypes} = React;
const { connect, connectAdvanced } = require('react-redux');
const util = require('./util');
const _ = require('lodash');
const getOr = require('lodash/fp/getOr');
const {toPath} = _;
const {compose, mapProps, getContext, toClass, withProps, withPropsOnChange, pure, shouldUpdate} = require('recompose');
const namespace = require('./namespace');
const { createSelector, defaultMemoize, createSelectorCreator } = require('reselect');
const shallowEqual = require('./shallowEqual');
const actions = require('./actionCreators');
const {isDependant,isAsync} = require('./specialRules');
const DeepMap = require('./DeepMap');

const defaultValueGetter = (_,p) => p.defaultValue;
const stateGetter = (s,p) => _.get(s, [namespace, p.form.id], {});

const ruleCache = new DeepMap();
const notFound = Symbol();

function getErrors(value, rules, defaultErrorMessage, defaultPendingMessage, ui, formData, dispatch,formId, name) {
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
        // console.log(`GET ERRORS FOR ${formId}.${name}`);
        if(err === notFound) {
            err = fn(...args);
            ruleCache.set(key, err); // TODO: should we cache everything or just promises?
            if(err instanceof Promise) {
                dispatch(actions.asyncValidation(formId,name,false));
                err.then(val => {
                    // console.log('promise resolved',key,val);
                    ruleCache.set(key, val);
                    dispatch(actions.asyncValidation(formId,name,true));
                }, () => {
                    // console.log('promise rejected',key);
                    ruleCache.delete(key);
                    dispatch(actions.asyncValidation(formId,name,true));
                });
            }
        }
        if(err instanceof Promise) {
            return '';
        } else if(util.isNullish(err) || err === true) {
            return false;
        } else if(err === false) {
            return defaultErrorMessage;
        }
        return err;
    }).filter(x => x);
}

function mapDispatchToProps(dispatch, formId, name) {
    return {
        actions: {
            change: value => {
                dispatch(actions.change(formId, name, value));
            },
        },
        events: {
            onChange: ev => {
                dispatch(actions.change(formId, name, ev.target.value));
            },
            onCheck: ev => {
                dispatch(actions.change(formId, name, ev.target.checked));
            },
            onFocus: () => {
                dispatch(actions.focus(formId, name));
            },
            onBlur: () => {
                dispatch(actions.blur(formId, name));
            },
            onMouseEnter: () => {
                dispatch(actions.mouseEnter(formId, name));
            },
            onMouseLeave: () => {
                dispatch(actions.mouseLeave(formId, name));
            },
            onSubmit: () => {
                dispatch(actions.submit(formId));
            },
        }
    };
}

function connectField() {
    return compose(
        toClass,
        getContext({form: PropTypes.object}),
        withPropsOnChange(['name','rules','formId'], props => {
            // console.log(props.name,'changing');
            const form = props.form || {
                id: props.formId,
                rules: [],
                fields: null,
            };
            const fieldRules = util.array(props.rules);
            const baseRules = form.rules ? util.array(util.glob(form.rules,props.name,[])) : [];
            return {
                form,
                rules: _.concat(baseRules, fieldRules),
            };
        }),
        // connect(require('./mapStateToProps'), require('./mapDispatchToProps')),
        connectAdvanced(selectorFactory),
        withPropsOnChange(['name'], ({name,form}) => {
            if(form.fields) {
                return {
                    ref: node => {
                        if(node) {
                            form.fields.set(name, node);
                        } else {
                            form.fields.delete(name);
                        }
                    }
                };
            }
        })
    );
}

function selectorFactory(dispatch, factoryOptions) {
    let dispatchSelector = defaultMemoize(mapDispatchToProps);
    let prevProps = {};

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
    const errorSelector = util.createDeepEqualSelector(
        [valueSelector, (_,p) => p.rules, (_,p) => p.defaultErrorMessage, (_,p) => p.defaultPendingMessage, stateUiSelector, dataGetter, () => dispatch, (_, p) => p.form.id, (_, p) => p.name],
        getErrors
    );

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
        pendingValidations: ui.pendingValidations,
        isDirty,
        isValid,
        isEmpty,
        formValidated,
    }));

    return (state, props) => {
        let nextProps = Object.assign({
            value: valueSelector(state, props),
            errors: errorSelector(state, props),
            ui: uiSelector(state, props),
        }, dispatchSelector(dispatch, props.form.id, props.name), props);
        
        if(shallowEqual(prevProps, nextProps)) {
            return prevProps;
        }
        
        return prevProps = nextProps;
    }
}


module.exports = connectField;