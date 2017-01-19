const React = require('react');
const {PropTypes} = React;
// const XPropTypes = require('./XPropTypes');
const util = require('./util');

class FormProvider extends React.Component {
    getChildContext() {
        return {
            form: {
                id: this.props.id,
                rules: this.props.rules ? util.unflatten(this.props.rules) : {},
            },
        };
    }

    render() {
        return this.props.children;
    }
}

FormProvider.propTypes = {
    children: PropTypes.element,
    id: PropTypes.string.isRequired,
    rules: PropTypes.object,
};

FormProvider.childContextTypes = {
    form: PropTypes.object,
};

module.exports = FormProvider;