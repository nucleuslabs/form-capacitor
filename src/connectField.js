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
const notFound = Symbol('NotFound');
const noError = Symbol('NoError');
const pending = Symbol('Pending');

const errTypeToProp = {
    // 'err': 'errors',
    'error': 'errors',
    // 'warn': 'warnings',
    'warning': 'warnings',
};

// window.RULE_CACHE = ruleCache;


function getErrorMessage(rule, args) {
    if(_.isFunction(rule.message)) {
        return rule.message(...args);
    } else if(_.isString(rule.message)) {
        return rule.message;
    } else {
        throw new Error(`Unsupported rule message type`);
    }
}

function getErrors(value, rules, formData, dispatch,formId, name, pendingValidations) {
    const getValue = f => _.get(formData, f);
    
    // console.log(formId,name,pendingValidations);
    
    let out = {
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
            let [lastArgs, lastError] = result;

            if(rule.compare(args,lastArgs)) {
                handled = true;
                // console.log('cache hit');
                if(lastError !== noError && lastError !== pending) {
                    out[errKey].push(lastError);
                }
            }
        }

        if(!handled) {
            if(rule.isAsync) { 
                if(rule.type === 'error' && out[errKey].length) {
                    // skip if other error rules are already failing
                    continue; 
                }
                
                ruleCache.set(cacheKey,[args,pending]);
                dispatch(actions.asyncValidation(formId,name,false));
                rule.isValid(...args).then(isValid => {
                    let message = isValid ? noError : getErrorMessage(rule, args);
                    ruleCache.set(cacheKey,[args,message]); // fixme: might overwrite a newer error...
                    dispatch(actions.asyncValidation(formId,name,true));
                }, () => {
                    ruleCache.delete(cacheKey);
                    dispatch(actions.asyncValidation(formId,name,true));
                });
            } else {
                let isValid = rule.isValid(...args);
                let message = noError;
                if(!isValid) {
                    message = getErrorMessage(rule, args);
                    out[errKey].push(message);
                }
                ruleCache.set(cacheKey,[args,message]);
            }
        }
    }
    
    return out;
    
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