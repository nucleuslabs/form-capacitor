const React = require('react');
const {PropTypes} = React;
const { connect, connectAdvanced } = require('react-redux');
const util = require('./util');
const _ = require('lodash');
const {compose, mapProps, getContext, toClass, withProps, withPropsOnChange, pure, shouldUpdate} = require('recompose');
const namespace = require('./namespace');
const { createSelector, defaultMemoize, createSelectorCreator } = require('reselect');
const shallowEqual = require('./shallowEqual');

const mapStateToProps = require('./mapStateToProps');
const mapDispatchToProps = require('./mapDispatchToProps');

function connectField() {
    return compose(
        toClass,
        getContext({form: PropTypes.object}),
        withPropsOnChange(['name','rules','form','formId'], props => {
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
        connectAdvanced((dispatch, factoryOptions) => {
            let stateSelector = mapStateToProps();
            let dispatchSelector = createSelector(d => d, (_, p) => p.form, (_, p) => p.name, mapDispatchToProps);
            let lastProps = {};
            
            return (state, props) => {
                let newProps = Object.assign(stateSelector(state, props), dispatchSelector(dispatch, props), props);
                if(shallowEqual(lastProps, newProps)) {
                    return lastProps;
                }
                return lastProps = newProps;
            }
        }),
        withPropsOnChange((prevProps,nextProps) => !!nextProps.form.fields, ({name,form}) => {
            return {
                ref: node => {
                    if(node) {
                        form.fields.set(name, node);
                    } else {
                        form.fields.delete(name);
                    }
                }
            };
        })
    );
}


module.exports = connectField;