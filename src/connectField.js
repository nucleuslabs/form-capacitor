const React = require('react');
const {PropTypes} = React;
const { connect, connectAdvanced } = require('react-redux');
const util = require('./util');
const _ = require('lodash');
const {compose, mapProps, getContext, toClass, withProps, withPropsOnChange} = require('recompose');
const namespace = require('./namespace');

function connectField() {
    return compose(
        toClass,
        getContext({form: PropTypes.object}),
        mapProps(props => {
            const form = props.form || {
                id: props.formId,
                rules: [],
                fields: null,
            };
            // const formId = props.formId || form.id;
            const fieldRules = util.array(props.rules);
            const baseRules = form.rules ? util.array(util.glob(form.rules,props.name,[])) : [];
            let newProps = Object.assign(
                {
                    // formId, // TODO: delete this
                    form,
                },
                // _.omit(props, ['form']),
                props,
                {
                    rules: _.concat(baseRules, fieldRules),
                }
            );
            // if(form.fields) {
            //     newProps.ref = node => {
            //         if(node) {
            //             form.fields.set(props.name, node);
            //         } else {
            //             form.fields.delete(props.name);
            //         }
            //     }
            // }
            return newProps;
        }),
        connect(require('./mapStateToProps'), require('./mapDispatchToProps')),
        withPropsOnChange((props,nextProps) => !!nextProps.form.fields, ({name,form}) => {
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