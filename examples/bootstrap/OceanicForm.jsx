const React = require('react');
const {FormProvider, Rules, connectForm, dependantRule, asyncRule} = require('form-capacitor');
const TextBox = require('./TextBox');


class OceanicForm extends React.PureComponent {

    setEmail = ev => {
        ev.preventDefault();
        this.props.setField('email','mpenner@nucleuslabs.com');
    };

    setFocus = ev => {
        ev.preventDefault();
        this.props.setFocus('email');
    };

    appendDomain = ev => {
        ev.preventDefault();
        this.props.setField('email', e => e + '@nucleuslabs.com');
    };

    render() {
        return (
            <form>
                <TextBox name="email" placeholder="Email address" required={true}/>
                <button onClick={this.setEmail}>Set Email</button>
                <button onClick={this.setFocus}>Set Focus</button>
                <button onClick={this.appendDomain}>@nucleuslabs.com</button>
            </form>
        );
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const rules = {
    // email: [Rules.required, Rules.email, email => sleep(750).then(() => {
    //     if(email == 'mpenner@nucleuslabs.com') return "That email address is already registered";
    // })],
    
    email: [
        Rules.required,
        Rules.async(email => sleep(750).then(() => email !== 'mpenner@nucleuslabs.com'), {message:"That email address is already registered"}),
        Rules.email,
        Rules.custom(email => /@nucleuslabs.com$/i.test(email), {message:"Not a company email address",type:'warning'})
    ]
};

module.exports = connectForm({rules})(OceanicForm);