const React = require('react');
const {PropTypes} = React;
const util = require('form-capacitor/util');
const _ = require('lodash');
const actionTypes = require('form-capacitor/actionTypes');
const css = require('./style.less');
const connectField = require('form-capacitor/connectField');

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
        // console.log(this.inputWrap.firstChild);
        
        if(this.inputWrap && this.inputWrap.firstChild && this.tooltip) {
            let input = this.inputWrap.firstChild;
            let inRect = input.getBoundingClientRect();
            let ttRect = this.tooltip.getBoundingClientRect();
            
            Object.assign(this.tooltip.style, {
                left: `${input.offsetLeft - (ttRect.width - inRect.width)/2}px`,
                top: `${input.offsetTop + inRect.height + 4}px`,
            });
        }
    }

    renderTooltip() {
        const {errors, ui} = this.props;

        if((ui.isFocused || (ui.isHovering && ui.wasFocused)) && errors.length) {
            return (
                <div ref={n => {this.tooltip = n}} className={css.tooltip}>
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

StatelessField.propTypes = {
    value: PropTypes.any.isRequired,
    dispatch: PropTypes.func.isRequired,
    children: PropTypes.element.isRequired,
    formId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    ui: PropTypes.object.isRequired,
    errors: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.element])).isRequired,
    rules: PropTypes.oneOfType([PropTypes.func, PropTypes.arrayOf(PropTypes.func.isRequired)]),
};

const Field = connectField()(StatelessField);

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


module.exports = Field;