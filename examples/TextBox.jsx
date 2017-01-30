const React = require('react');
const {PropTypes} = React;
const _ = require('lodash');
const css = require('./TextBox.less');
const {connectField,util} = require('form-capacitor');
const ShortId = require('shortid');
const classNames = require('classnames');

const SKIP = false;

class StatelessTextBox extends React.PureComponent {
    
    onChange = ev => {
        this.props.dispatchChange(ev.target.value);
    };

    render() {
        
        return (
            <label className={classNames(css.wrap,this.props.ui.isFocused ? css.focused : SKIP, this.props.value === '' ? css.empty : css.filled)} onMouseEnter={this.props.dispatchMouseEnter} onMouseLeave={this.props.dispatchMouseLeave}>
                <input className={css.input} onChange={this.onChange} onFocus={this.props.dispatchFocus} onBlur={this.props.dispatchBlur} required={this.props.required} />
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