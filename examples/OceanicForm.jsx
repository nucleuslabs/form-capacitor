const React = require('react');
const {FormProvider, Rules, connectForm, dependantRule, asyncRule} = require('form-capacitor');
const TextBox = require('./TextBox');


class OceanicForm extends React.PureComponent {

    render() {
        return (
            <form>
                <TextBox name="email" placeholder="Email address" required={true}/>
            </form>
        );
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const rules = {
    email: [Rules.required, Rules.email, email => sleep(750).then(() => {
        if(email == 'mpenner@nucleuslabs.com') return "That email address is already registered";
    })],
};

module.exports = connectForm({rules})(OceanicForm);