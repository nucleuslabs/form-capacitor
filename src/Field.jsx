const React = require('react');
const {PropTypes} = React;
const { connect, connectAdvanced } = require('react-redux');
const util = require('./util');
const _ = require('lodash');
const {toPath} = _;
import actionTypes from './actionTypes';
const {fluxStandardAction} = require('./actionCreators');
const { createSelector } = require('reselect');
const styles = require('./classNames');
const {compose, mapProps, getContext} = require('recompose');

class Field extends React.PureComponent {

    // static contextTypes = {
    //     formId: PropTypes.string,
    // };

    render() {
        const {value, children, dispatch, touched, errors} = this.props;
        // console.log('FORM ID',this.context.formId);
        // console.log(this.props);

        let attrs = {
            value,
            onChange: ev => {
                dispatch(actionTypes.CHANGE,{value: ev.target.value});
            },
            onFocus: ev => {
                dispatch(actionTypes.FOCUS, {focused: true});
            },
            onBlur: ev => {
                dispatch(actionTypes.FOCUS, {focused: false});
            },
        };

        if(touched) {
            attrs.className = errors.length === 0 ? styles.fieldValid : styles.fieldError;
        }

        let input = React.cloneElement(children, util.mergeAttrs(attrs, children.props));

        return (
            <span>
                <span ref={n => {this.inputWrap = n;}}>{input}</span>
                {this.renderTooltip()}
            </span>
        );
    }

    componentDidUpdate(prevProps, prevState) {
        this.afterRender();
    }

    componentDidMount() {
        this.afterRender();
    }

    afterRender() {
        if(this.inputWrap && this.inputWrap.firstChild && this.tooltip) {
            let inputRect = this.inputWrap.firstChild.getBoundingClientRect();
            let ttRect = this.tooltip.getBoundingClientRect();
            let ttLeft = inputRect.left - (ttRect.width - inputRect.width)/2;

            Object.assign(this.tooltip.style, {
                top: `${inputRect.bottom + 4}px`,
                left: `${ttLeft}px`,
            });
        }
    }

    renderTooltip() {
        const {errors, focused} = this.props;

        if(focused && errors.length) {
            return (
                <div ref={n => {
                    this.tooltip = n;
                }} className={styles.errorTooltip}>
                    {errors.length > 1
                        ? (
                            <ul>
                                {errors.map((err, i) => <li key={i}>{err}</li>)}
                            </ul>
                        )
                        : <span>{errors[0]}</span>
                    }
                </div>
            );
        }
        return null;
    }
}


function getValue(state, props) {
    return _.get(state, ['forms', props.formId, 'data', ...toPath(props.name)], props.defaultValue);
}

function getFocused(state, props) {
    return _.get(state, ['forms', props.formId, 'ui', ...toPath(props.name), 'focused'], false);
}

function getTouched(state, props) {
    return _.get(state, ['forms', props.formId, 'ui', ...toPath(props.name), 'touched'], false);
}

function getRules(state, props) {
    return util.toArray(props.rules);
}

function getDefaultMessage(state, props) {
    return props.defaultMessage;
}

const getErrors = createSelector([getValue, getTouched, getRules, getDefaultMessage], (value, touched, rules, defaultMessage) => {
    if(!touched) return [];

    // TODO: how to support promises like in textInput.jsx?
    return rules.map(rule => rule(value)).map(result => {
        if(util.isNullish(result) || result === true) {
            return false;
        } else if(result === false) {
            return defaultMessage;
        }
        return result;
    }).filter(x => x);
});

function mapStateToProps(state, props) {
    return {
        value: getValue(state, props),
        focused: getFocused(state, props),
        touched: getTouched(state, props),
        errors: getErrors(state, props),
    };
}

function mapDispatchToProps(dispatch, {formId,name}) {
    return {
        dispatch: (actionType, payload) => {
            dispatch(fluxStandardAction(actionType, {...payload,formId,name}));
        }
    };
}

Field.propTypes = {
    value: PropTypes.any.isRequired,
    dispatch: PropTypes.func.isRequired,
    children: PropTypes.element.isRequired,
    formId: PropTypes.string,
    name: PropTypes.string.isRequired,
    focused: PropTypes.bool.isRequired,
    touched: PropTypes.bool.isRequired,
    errors: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.element])).isRequired,
    rules: PropTypes.oneOfType([PropTypes.func, PropTypes.arrayOf(PropTypes.func.isRequired)]),
};

// function selectorFactory(dispatch, factoryOptions) {
//     console.log('AAA', factoryOptions.WrappedComponent.props);
//     return (nextState, nextProps, nextContect) => {
//         // console.log('BBB', context);
//         return mergeAttrs({}, nextProps, mapStateToProps(nextState, nextProps), mapDispatchToProps(dispatch, nextProps));
//     };
// }
//
// const ConnectedField = connectAdvanced(selectorFactory, {withRef: true})(Field);


// const ConnectedField = connect(mapStateToProps, mapDispatchToProps)(Field);
const ContextField = compose(
    getContext({form: PropTypes.object}),
    mapProps(props => {
        const form = props.form || {};
        const fieldRules = util.array(props.rules);
        const baseRules = util.array(util.glob(form.rules,props.name,[]));
        return {
            formId: form.id,
            ..._.omit(props, ['form']),
            rules: _.concat(baseRules, fieldRules),
        };
    }),
    connect(mapStateToProps, mapDispatchToProps)
)(Field);

ContextField.propTypes = {
    children: PropTypes.element.isRequired,
    formId: PropTypes.string,
    name: PropTypes.string.isRequired,
    rules: PropTypes.oneOfType([PropTypes.func, PropTypes.arrayOf(PropTypes.func.isRequired)]),
    defaultMessage: PropTypes.string,
};

ContextField.defaultProps = {
    // formId: 'default',
    defaultMessage: "This field is invalid",
};

// ConnectedField.contextTypes = {
//     formId: PropTypes.string,
//     store: PropTypes.object.isRequired,
// };

module.exports = ContextField;