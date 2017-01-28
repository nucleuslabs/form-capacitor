const React = require('react');
const {PropTypes} = React;
const _ = require('lodash');
const css = require('./ValueField.less');
const {connectField,util} = require('form-capacitor');
const ShortId = require('shortid');
const classNames = require('classnames');

class StatelessBootstrapCheckbox extends React.PureComponent {
    

    onChange = ev => {
        this.props.dispatchChange(ev.target.checked);
    };

    render() {
        const {value, children, dispatch, ui, errors, rules, name, options, disabled} = this.props;


        let wrapClassName, inputClassName;
        if(rules.length && (ui.wasFocused || ui.formValidated)) {
            if(errors.length === 0) {
                inputClassName = css.fieldValid;
                wrapClassName = css.wrapValid;
            } else {
                inputClassName = css.fieldError;
                wrapClassName = css.wrapError;
            }
        }

        return (
            <div>
                <div className={classNames('form-group',wrapClassName,{disabled})} onMouseEnter={this.props.dispatchMouseEnter} onMouseLeave={this.props.dispatchMouseLeave}>
                    <label ref={n => {this.inputWrap = n}} className="custom-control custom-checkbox">
                        <input type="checkbox" className="custom-control-input" checked={value} disabled={disabled} onChange={this.onChange} onFocus={this.props.dispatchFocus} onBlur={this.props.dispatchBlur}/>
                        <span className={classNames('custom-control-indicator',inputClassName)}/>
                        <span className="custom-control-description">{children}</span>
                    </label>
                </div>
                {this.renderTooltip()}
            </div>
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

        if(this.inputWrap && this.tooltip) {
            let inRect = this.inputWrap.getBoundingClientRect();
            let ttRect = this.tooltip.getBoundingClientRect();

            Object.assign(this.tooltip.style, {
                left: `${this.inputWrap.offsetLeft - (ttRect.width - inRect.width)/2}px`,
                top: `${this.inputWrap.offsetTop + inRect.height + 5}px`,
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

StatelessBootstrapCheckbox.propTypes = {
    value: PropTypes.any.isRequired,
    // dispatch: PropTypes.func.isRequired,
    // formId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    ui: PropTypes.object.isRequired,
    errors: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.element])).isRequired,
    rules: PropTypes.oneOfType([PropTypes.func, PropTypes.arrayOf(PropTypes.func.isRequired)]),
};

const BootstrapCheckbox = connectField()(StatelessBootstrapCheckbox);

BootstrapCheckbox.propTypes = {
    // formId: PropTypes.string,
    name: PropTypes.string.isRequired,
    rules: PropTypes.oneOfType([PropTypes.func, PropTypes.arrayOf(PropTypes.func.isRequired)]),
    defaultMessage: PropTypes.string,
};

BootstrapCheckbox.defaultProps = {
    // formId: 'default',
    defaultMessage: "This field is invalid",
    defaultValue: '',
};


module.exports = BootstrapCheckbox;