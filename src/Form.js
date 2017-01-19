const React = require('react');
const {PropTypes} = React;
const ExtraPropTypes = require('./ExtraPropTypes');
const util = require('./util');

export default class Form extends React.Component {
    static propTypes = {
        children: ExtraPropTypes.anyChildren,
        id: PropTypes.string,
        rules: PropTypes.object,
    };

    static childContextTypes = {
        form: PropTypes.object,
    };

    getChildContext() {
        return {
            form: {
                id: this.props.id || this.displayName,
                rules: this.props.rules ? util.unflatten(this.props.rules) : {},
            },
        };
    }

    render() {
        return this.props.children;
    }
}