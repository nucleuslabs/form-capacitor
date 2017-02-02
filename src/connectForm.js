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

function mapDispatchToProps(dispatch, props) {
    return {
        validate: () => { // FIXME: not sure if this should trigger a submit or not....
            dispatch(actions.submit(props.id));
            return Array.from(props.form.fields.values()).every(f => f.props.ui.isValid);
        },
        setField: (name, value) => {
            if(_.isFunction(value)) {
                value = value(_.get(props.data, name));
            }
            dispatch(actions.change(props.id, name, value));
        },
        setFocus: (name) => {
            let input = props.form.inputs.get(name);
            if(input) {
                input.focus();
                if(input.scrollIntoViewIfNeeded) {
                    input.scrollIntoViewIfNeeded(false);
                }
            } else {
                console.warn(`Field '${props.form.id}.${name}' was not found for focusing; did you set <input ref={this.props.focusRef}>?`);
            }
        }
    };
}

function mapStateToProps(state, props) {
    const dataSelector = createSelector(stateGetter, state => _.get(state, 'data', emptyObject));

    return (state, props) => ({
        data: dataSelector(state, props),
    });
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
                    inputs: new Map(),
                },
            })
        ),
        getContext(contextTypes),
        connect(mapStateToProps, mapDispatchToProps),
        // connectAdvanced(selectorFactory)
    );
}



// function selectorFactory(dispatch, factoryOptions) {
//     const dataSelector = createSelector(stateGetter, state => _.get(state, 'data', emptyObject));
//     let dispatchSelector = defaultMemoize(mapDispatchToProps);
//     let prevProps = {};
//    
//     return (state, props) => {
//         let data = dataSelector(state, props);
//         let nextProps = {
//             data,
//             ...dispatchSelector(dispatch, props.form, data),
//             ...props,
//         };
//
//         if(shallowEqual(prevProps, nextProps)) {
//             return prevProps;
//         }
//
//         return prevProps = nextProps;
//     }
// }

module.exports = connectForm;