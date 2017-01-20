const React = require('react');
const {PropTypes} = React;
const { connect, connectAdvanced } = require('react-redux');
const util = require('./util');
const _ = require('lodash');
const {toPath} = _;
const actionTypes = require('./actionTypes');
const {fluxStandardAction} = require('./actionCreators');
const { createSelector } = require('reselect');
const css = require('./classes');
const {compose, mapProps, getContext} = require('recompose');
const namespace = require('./namespace');

class StatelessField extends React.PureComponent {

    // static contextTypes = {
    //     formId: PropTypes.string,
    // };

    render() {
        const {value, children, dispatch, ui, errors, rules, name} = this.props;
        // console.log('FORM ID',this.context.formId);
        // console.log(this.props);
        
        let attrs = {
            value,
            onChange: ev => {
                dispatch(actionTypes.CHANGE,{value: ev.target.value});
            },
            onFocus: ev => {
                dispatch(actionTypes.FOCUS, {isFocused: true});
            },
            onBlur: ev => {
                dispatch(actionTypes.FOCUS, {isFocused: false});
            },
            onMouseEnter: ev => {
                dispatch(actionTypes.HOVER, {isHovering: true});
            },
            onMouseLeave: ev => {
                dispatch(actionTypes.HOVER, {isHovering: false});
            },
        };

        let wrapClassName;
        if(rules.length && ui.wasFocused) {
            if(errors.length === 0) {
                attrs.className = css.fieldValid;
                wrapClassName = css.wrapValid;
            } else {
                attrs.className = css.fieldError;
                wrapClassName = css.wrapError;
            }
        }

        let input = React.cloneElement(children, util.mergeAttrs(attrs, children.props));

        return (
            <span className={wrapClassName}>
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
                }} className={css.tooltip}>
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


const getValue = (state, props) => {
    return _.get(state, [namespace, props.formId, 'data', ...toPath(props.name)], props.defaultValue);
};

const getInitialValue = (state, props) => {
    return _.get(state, [namespace, props.formId, 'initial', ...toPath(props.name)], props.defaultValue);
};

const getIsFocused = (state, props) => {
    return _.get(state, [namespace, props.formId, 'ui', ...toPath(props.name), 'isFocused'], false);
};
const getWasFocused = (state, props) => {
    return _.get(state, [namespace, props.formId, 'ui', ...toPath(props.name), 'wasFocused'], false);
};
const getIsHovering = (state, props) => {
    return _.get(state, [namespace, props.formId, 'ui', ...toPath(props.name), 'isHovering'], false);
};
const getRules = (state, props) => {
    return util.array(props.rules);
};

const getDefaultMessage = (state, props) => {
    return props.defaultMessage;
};

const getErrors = createSelector([getValue, getRules, getDefaultMessage], (value, rules, defaultMessage) => {
    // if(!touched) return [];
    
    let meta = {
        // wasFocused
    };
    
    // TODO: how to support promises like in textInput.jsx?
    return rules.map(rule => rule(value, meta)).map(result => {
        if(util.isNullish(result) || result === true) {
            return false;
        } else if(result === false) {
            return defaultMessage;
        }
        return result;
    }).filter(x => x);
});

const getIsDirty = createSelector([getValue, getInitialValue], _.isEqual);
const getIsEmpty = createSelector([getValue, (_,props) => props.defaultValue], _.isEqual);
const getIsValid = createSelector([getErrors], errors => errors.length === 0);

const mapStateToProps = (state, props) => {
    let value = getValue(state, props);
    let initialValue = getInitialValue(state, props);
    let errors = getErrors(state, props);
    
    let ui = {
        isDirty: !_.isEqual(value, initialValue),
        isValid: errors.length === 0,
        isEmpty: _.isEqual(value, props.defaultValue),
        isFocused: _.get(state, [namespace, props.formId, 'ui', ...toPath(props.name), 'isFocused'], false),
        isHovering: _.get(state, [namespace, props.formId, 'ui', ...toPath(props.name), 'isHovering'], false),
        mouseEntered: _.get(state, [namespace, props.formId, 'ui', ...toPath(props.name), 'mouseEntered'], false),
        mouseLeft: _.get(state, [namespace, props.formId, 'ui', ...toPath(props.name), 'mouseLeft'], false),
        wasFocused: _.get(state, [namespace, props.formId, 'ui', ...toPath(props.name), 'wasFocused'], false),
        wasBlurred: _.get(state, [namespace, props.formId, 'ui', ...toPath(props.name), 'wasBlurred'], false),
        wasChanged: _.get(state, [namespace, props.formId, 'ui', ...toPath(props.name), 'wasChanged'], false),
    };
    
    return {value,ui,errors};
};

const mapDispatchToProps = (dispatch, {formId,name}) => {
    return {
        dispatch: (actionType, payload) => {
            dispatch(fluxStandardAction(actionType, Object.assign({}, payload, {formId,name})));
        }
    };
};

StatelessField.propTypes = {
    value: PropTypes.any.isRequired,
    dispatch: PropTypes.func.isRequired,
    children: PropTypes.element.isRequired,
    formId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    // isFocused: PropTypes.bool.isRequired,
    // wasFocused: PropTypes.bool.isRequired,
    ui: PropTypes.object.isRequired,
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
const Field = compose(
    getContext({form: PropTypes.object}),
    mapProps(props => {
        const form = props.form || {};
        const fieldRules = util.array(props.rules);
        const baseRules = form.rules ? util.array(util.glob(form.rules,props.name,[])) : [];
        return Object.assign(
            {
                formId: form.id
            },
            _.omit(props, ['form']),
            {
                rules: _.concat(baseRules, fieldRules),
            }
        );
    }),
    connect(mapStateToProps, mapDispatchToProps)
)(StatelessField);


Field.propTypes = {
    children: PropTypes.element.isRequired,
    formId: PropTypes.string,
    name: PropTypes.string.isRequired,
    rules: PropTypes.oneOfType([PropTypes.func, PropTypes.arrayOf(PropTypes.func.isRequired)]),
    defaultMessage: PropTypes.string,
};

Field.defaultProps = {
    // formId: 'default',
    defaultMessage: "This field is invalid",
    defaultValue: '',
};

// ConnectedField.contextTypes = {
//     formId: PropTypes.string,
//     store: PropTypes.object.isRequired,
// };

module.exports = Field;