const React = require('react');
const {PropTypes} = React;
const util = require('form-capacitor/util');
const css = require('./ValueField.less');
const connectField = require('form-capacitor/connectField');
const classNames = require('classnames');

class StatelessValueField extends React.PureComponent {

    // static contextTypes = {
    //     formId: PropTypes.string,
    // };

    render() {
        const {value, children, dispatch, ui, errors, rules, name, valueGetter} = this.props;
        // console.log('FORM ID',this.context.formId);
        // console.log(this.props);
        
        let attrs = {
            value,
            onChange: ev => {
                this.props.actions.change(valueGetter(ev));
            },
            onFocus: this.props.events.onFocus,
            onBlur: this.props.events.onBlur,
            onMouseEnter: this.props.events.onMouseEnter,
            onMouseLeave: this.props.events.onMouseLeave,
        };

        let wrapClassName;
        let myClassNames = []
        if(rules.length && (ui.wasFocused || ui.formValidated)) {
            if(errors.length === 0) {
                myClassNames.push(css.fieldValid);
                wrapClassName = css.wrapValid;
            } else {
                myClassNames.push(css.fieldError);
                wrapClassName = css.wrapError;
            }
        }

        if(this.props.ui.wasChanged){
            myClassNames.push(css.fieldWasChanged);
        }

        if(this.props.ui.isDirty){
            myClassNames.push(css.fieldDirty);
        }

        let input = React.cloneElement(children, util.mergeAttrs(attrs, children.props, {className: classNames(myClassNames)}));

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
                top: `${input.offsetTop + inRect.height + 5}px`,
            });
        }
    }

    renderTooltip() {
        const {errors, ui} = this.props;

        if((ui.isFocused || (ui.isHovering && (ui.wasFocused || ui.formValidated))) && errors.length) {
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

StatelessValueField.propTypes = {
    value: PropTypes.any.isRequired,
    // dispatch: PropTypes.func.isRequired,
    children: PropTypes.element.isRequired,
    // formId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    ui: PropTypes.object.isRequired,
    errors: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.element])).isRequired,
    rules: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func.isRequired,PropTypes.object.isRequired])),
    valueGetter: PropTypes.func.isRequired,
};

const ValueField = connectField()(StatelessValueField);

ValueField.propTypes = {
    children: PropTypes.element.isRequired,
    // formId: PropTypes.string,
    name: PropTypes.string.isRequired,
    rules: PropTypes.oneOfType([PropTypes.func, PropTypes.arrayOf(PropTypes.func.isRequired)]),
    defaultMessage: PropTypes.string,
    valueGetter: PropTypes.func,
};

ValueField.defaultProps = {
    // formId: 'default',
    // defaultErrorMessage: "This field is invalid",
    defaultValue: '',
    valueGetter: ev => ev.target.value,
};


module.exports = ValueField;