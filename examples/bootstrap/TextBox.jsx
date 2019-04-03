const React = require('react');
const {PropTypes} = React;
const _ = require('lodash');
const css = require('./TextBox.less');
const {connectField,util} = require('form-capacitor');
const ShortId = require('shortid');
const classNames = require('classnames');
const Svg = require('./Svg');
const sprites = require('./sprites');

class StatelessTextBox extends React.PureComponent {
    
    render() {
        let labelEvents = util.pick(this.props.events, {onMouseEnter:1,onMouseLeave:1});
        let inputEvents = util.pick(this.props.events, {onChange:1,onFocus:1,onBlur:1});
        
        return (
            <label className={classNames(
                css.wrap,
                this.props.ui.isFocused ? css.focused : false, 
                this.props.value === '' ? css.empty : css.filled, 
            )} {...labelEvents}>
                <input value={this.props.value} ref={this.props.focusRef} className={css.input} {...inputEvents} required={this.props.required} />
                <span className={css.placeholder}>{this.props.placeholder}</span>
                {this.renderIcon()}
            </label>
        );
    }
    
    renderIcon() {
        if(this.props.ui.isValidating) {
            // return <span className={css.icon}><div className="loader"/></span>;
            return <Svg title="Validating" sprite={sprites.loader} className={classNames(css.icon,css.spin)} fill="#008bff"/>;
        }
        
        if(this.props.required && this.props.value === '') {
            return <Svg title="Required" sprite={sprites.asterisk} className={css.icon} fill={this.props.ui.wasFocused ? '#f25041' : '#ccc'}/>;
        }

        if(this.props.errors.length > 0) {
            return <Svg title="Invalid" sprite={sprites.cross} className={css.icon} fill="#f25041"/>;
        } 
        
        if(this.props.warnings.length > 0) {
            return <Svg title="Warning" sprite={sprites.warning} className={css.icon} fill="#F5DA55"/>;
        }
        
        return <Svg title="Valid" sprite={sprites.checkmark} className={css.icon} fill={this.props.ui.isFocused ? '#91DC5A' : '#ccc'}/>;
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