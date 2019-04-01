const React = require('react');
const PropTypes = require('prop-types');
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

function focusInput(input) {
    input.focus(); // TODO: check if input is an element, otherwise throw warning if it's a React component
    if(input.scrollIntoViewIfNeeded) {
        input.scrollIntoViewIfNeeded(false);
    }
}

const contextTypes = {
    form: PropTypes.object,
};

function connectForm(options) {
    return compose(
        withContext(
            contextTypes,
            props => {
                let rules = props.rules || options.rules;
                return {
                    form: {
                        id: props.id || options.id || ShortId.generate(),
                        rules: rules ? util.unflatten(rules) : emptyObject,
                        fields: new Map(),
                        inputs: new Map(),
                    },
                }
            }
        ),
        getContext(contextTypes),
        // connect(mapStateToProps, mapDispatchToProps),
        connectAdvanced(selectorFactory)
    );
}


function selectorFactory(dispatch, factoryOptions) {
    const dataSelector = createSelector(stateGetter, state => _.get(state, 'data', emptyObject));
    const initialSelector = createSelector(stateGetter, state => _.get(state, 'initial', emptyObject));
    const dirtySelector = defaultMemoize((d,i) => !_.isEqual(d,i));
    const dirtyDirtySelector = createSelector(dataSelector, initialSelector, (d, i) => () => dirtySelector(d,i));
    let prevProps = {};

    //Memoized Methods

    const validate = defaultMemoize((dispatch, form) => () => {
        dispatch(actions.submit(form.id));
        return Array.from(form.fields.values()).every(f => f.props.errors.length === 0);
    });

    const setField = defaultMemoize((dispatch, form) => (name, value, data) => {
        if(_.isFunction(value)) {
            let prevValue = _.get(data, name);
            if(prevValue === undefined) {
                let field = form.fields.get(name);
                if(field) {
                    prevValue = field.props.defaultValue;
                }
            }
            value = value(prevValue);
        }
        dispatch(actions.change(form.id, name, value));
    });

    const setFocus = defaultMemoize((dispatch, form) => name => {
        let input = form.inputs.get(name);
        if(input) {
            focusInput(input);
        } else {
            setTimeout(() => {
                let input = form.inputs.get(name);
                if(input) {
                    focusInput(input);
                } else {
                    console.warn(`Field '${form.id}.${name}' was not found for focusing; did you set <input ref={this.props.focusRef}>?`);
                }
            }, 0);
        }
    });

    const data = Object.assign({}, ({...state}) => _.get(state, 'data', emptyObject));
    const saveState = defaultMemoize((dispatch, form, data) => () => {
        dispatch(actions.saveState(form.id, data));
    });

    //Exposed Form Connect Methods and Props
    return (state, props) => {
        let data = dataSelector(state, props);
        /*FIXME: Everything is working as expected and re-renders are happening when they should...
        but setField, saveState and isDirty cause a warning because a different closure is being returned
        each time a change happens */
        let nextProps = {
            data,
            validate: validate(dispatch, props.form),
            setField: setField(dispatch, props.form, data),
            setFocus: setFocus(dispatch, props.form),
            saveState: saveState(dispatch, props.form, data),
            isDirty: dirtyDirtySelector(state, props),
            ...props,
        };

        if(shallowEqual(prevProps, nextProps)) {
            return prevProps;
        }

        return prevProps = nextProps;
    }
}

module.exports = connectForm;