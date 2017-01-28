const React = require('react');
const {PropTypes} = React;
const _ = require('lodash');
const css = require('./TextBox.less');
const {connectField,util} = require('form-capacitor');
const ShortId = require('shortid');
const classNames = require('classnames');

class StatelessTextBox extends React.PureComponent {


    onChange = ev => {
        this.props.dispatchChange(ev.target.value);
    };

    render() {

        // let wrapClassName, inputClassName;
        // if(rules.length && (ui.wasFocused || ui.formValidated)) {
        //     if(errors.length === 0) {
        //         inputClassName = css.fieldValid;
        //         wrapClassName = css.wrapValid;
        //     } else {
        //         inputClassName = css.fieldError;
        //         wrapClassName = css.wrapError;
        //     }
        // }

        return (
            <label className={css.wrap} onMouseEnter={this.props.dispatchMouseEnter} onMouseLeave={this.props.dispatchMouseLeave}>
                <input className={css.input} onChange={this.props.onChange} onFocus={this.props.dispatchFocus} onBlur={this.props.dispatchBlur} required={this.props.required} />
                <span className={css.placeholder}>{this.props.placeholder}</span>
                {this.props.required ? <span className={css.required}/> : null}
            </label>
        );
    }

    componentDidUpdate(prevProps, prevState) {
        this.afterRender();
    }

    componentDidMount() {
        this.afterRender();
    }

    afterRender() {

    }


}

const TextBox = connectField()(StatelessTextBox);


TextBox.defaultProps = {
    defaultMessage: "This field is invalid.",
    defaultValue: '',
};


module.exports = TextBox;