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
// const notFound = Symbol('NotFound');
// const noError = Symbol('NoError');
// const pending = Symbol('Pending');

const errTypeToProp = {
    // 'err': 'errors',
    'error': 'errors',
    // 'warn': 'warnings',
    'warning': 'warnings',
};

// window.RULE_CACHE = ruleCache;


function getErrorMessages(result, rule, args) {
    if(result === true) {
        return [];
    }
    if(result === false) {
        if(_.isFunction(rule.message)) {
            return util.array(rule.message(...args));
        } else if(_.isString(rule.message)) {
            return util.array(rule.message);
        } else {
            throw new Error(`Unsupported rule.message type`);
        }
    }
    if(result) {
        // if result is not a boolean, it ought to be an error message or blank
        return util.array(result);
    }
    return [];
}

function getErrors(value, rules, formData, dispatch,formId, name, pendingValidations) {
    const getValue = f => _.get(formData, f);
    
    // console.log(formId,name,pendingValidations);
    
    let props = {
        errors: [],
        warnings: [],
    };
    
    
    if(rules.length > 1) {
        // sort async functions to the end so that they can be skipped if other validation rules are already failing
        rules = [...rules].sort((a, b) => {
            if(!!a.isAsync === !!b.isAsync) return 0;
            return a.isAsync ? 1 : -1;
        });
    }
    
    for(let rule of rules) {
        if(rule.isOptional && util.isEmpty(value)) {
            continue;
        }
        
        let dependsOn = util.array(rule.dependsOn);
        let args = [value];
        if(dependsOn.length) {
            args.push(...dependsOn.map(getValue));
        }

        if(!rule.precondition(...args)) {
            continue;
        }
        
        let errKey = errTypeToProp[rule.type];
        
        if(!errKey) {
            throw new Error(`Unsupported rule type: ${rule.type}`);
        }
        let cacheKey = [rule,formId,name];
        let result = ruleCache.get(cacheKey);
        let handled = false;
        
        if(result) {
            let [lastArgs, lastResult] = result;

            if(rule.compare(args,lastArgs)) {
                handled = true;
                props[errKey].push(...lastResult)
            }
        }

        if(!handled) {
            if(rule.isAsync) { 
                if(rule.type === 'error' && props[errKey].length) {
                    // skip if other error rules are already failing
                    continue; 
                }
                
                ruleCache.set(cacheKey,[args,[]]);
                dispatch(actions.asyncValidation(formId,name,false));
                rule.validate(...args).then(result => {
                    ruleCache.set(cacheKey,[args,getErrorMessages(result, rule, args)]); // fixme: might overwrite a newer error...
                    dispatch(actions.asyncValidation(formId,name,true));
                }, () => {
                    ruleCache.delete(cacheKey);
                    dispatch(actions.asyncValidation(formId,name,true));
                });
            } else {
                let result = rule.validate(...args);
                let messages = getErrorMessages(result, rule, args);
                props[errKey].push(...getErrorMessages(result,rule, args));
                ruleCache.set(cacheKey,[args,messages]);
            }
        }
    }
    
    return props;
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
        pendingValidations: 0,
    }, _.get(state, ['ui', ...np], {})));
    const dataGetter = createSelector(stateGetter, getOr({},'data'));
    const valueSelector = createSelector([dataGetter,namePathSelector, defaultValueGetter], (data,np,dv) => _.get(data, np, dv));
    const initialSelector = createSelector(stateGetter, getOr({},'initial'));
    const initialValueSelector = createSelector([initialSelector,namePathSelector, defaultValueGetter], (init,np,dv) => _.get(init, np, dv));
    const pendingValidationsSelector = createSelector(stateUiSelector, ui => ui.pendingValidations);
    
    const errorSelector = util.createDeepEqualSelector(
        [valueSelector, (_,p) => p.rules, dataGetter, () => dispatch, (_, p) => p.form.id, (_, p) => p.name, pendingValidationsSelector],
        getErrors
    );

    const isDirtySelector = createSelector([valueSelector,initialValueSelector], (value,initialValue) => !_.isEqual(value, initialValue));
    // const isValidSelector = createSelector(errorSelector, errors => errors.length === 0);
    const isEmptySelector = createSelector([valueSelector,defaultValueGetter], _.isEqual);
    const formValidatedSelector = createSelector(stateGetter, state => _.get(state, 'submit', 0) > 0);

    const uiSelector = util.createDeepEqualSelector([stateUiSelector,isDirtySelector,isEmptySelector,formValidatedSelector], (ui,isDirty,isEmpty,formValidated) => ({
        isFocused: ui.isFocused,
        isHovering: ui.isHovering,
        mouseEntered: ui.mouseEntered,
        mouseLeft: ui.mouseLeft,
        wasFocused: ui.wasFocused,
        wasBlurred: ui.wasBlurred,
        wasChanged: ui.wasChanged,
        isValidating: ui.pendingValidations > 0,
        isDirty,
        isEmpty,
        formValidated,
    }));

    return (state, props) => {
        let nextProps = {
            value: valueSelector(state, props),
            ui: uiSelector(state, props),
            ...errorSelector(state, props),
            ...dispatchSelector(dispatch, props.form.id, props.name),
            ...props,
        };
        
        if(shallowEqual(prevProps, nextProps)) {
            return prevProps;
        }
        
        return prevProps = nextProps;
    }
}


module.exports = connectField;