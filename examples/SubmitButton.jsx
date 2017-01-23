const React = require('react');
const {connectDispatcher} = require('form-capacitor');

class SubmitButton extends React.PureComponent {
    
    
    
    render() {
        return (
            <button type="submit" className="btn btn-primary" onClick={this.props.dispatchSubmit}>{this.props.children}</button>
        )
    }
}

module.exports = connectDispatcher()(SubmitButton);
