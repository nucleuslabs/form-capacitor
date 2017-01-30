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

};

module.exports = connectForm({rules})(OceanicForm);