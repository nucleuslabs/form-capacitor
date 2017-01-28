const React = require('react');
const {FormProvider, Rules, connectForm, dependantRule, asyncRule} = require('form-capacitor');
const TextBox = require('./TextBox');


class Form2 extends React.PureComponent {

    render() {
        return (
            <form>
                <TextBox placeholder="Please enter your email" required={true}/>
            </form>
        );
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const rules = {

};

module.exports = connectForm({rules})(Form2);