const React = require('react');
const {FormProvider, Rules, connectForm, dependantRule, asyncRule} = require('form-capacitor');
const ValueField = require('./ValueField');
const BootstrapRadio = require('./BootstrapRadio');
const BootstrapCheckbox = require('./BootstrapCheckbox');


function getMultiVal(ev) {
    return Array.from(ev.target.options).filter(o => o.selected).map(o => o.value);
}

class BootstrapForm extends React.PureComponent {
    
    render() {
        return (
            <form onSubmit={this.submit}>
                <div className="bd-example">
                    <div className="form-group">
                        <label htmlFor="exampleInputEmail1">Email address</label>
                        <ValueField name="email">
                            <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email"/>
                        </ValueField>
                        <small id="emailHelp" className="form-text text-muted">We'll never share your email with anyone
                            else.
                        </small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="exampleInputPassword1">Password</label>
                        <ValueField name="password">
                            <input type="password" className="form-control" id="exampleInputPassword1" placeholder="Password"/>
                        </ValueField>
                    </div>
                    <div className="form-group">
                        <label htmlFor="exampleInputPassword2">Confirm Password</label>
                        <ValueField name="confirmPassword">
                            <input type="password" className="form-control" id="exampleInputPassword2" placeholder="Re-type password"/>
                        </ValueField>
                    </div>
                    <div className="form-group">
                        <label htmlFor="exampleSelect1">Example select</label>
                        <ValueField name="numberselect">
                            <select className="form-control custom-select" id="exampleSelect1">
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                                <option>4</option>
                                <option>5</option>
                            </select>
                        </ValueField>
                    </div>
                    <div className="form-group">
                        <label htmlFor="exampleSelect2">Example multiple select</label>
    
                        <ValueField name="multiselect" defaultValue={[2,3]} valueGetter={getMultiVal}>
                            <select multiple className="form-control" id="exampleSelect2">
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                                <option>4</option>
                                <option>5</option>
                            </select>
                        </ValueField>
                    </div>
                    <div className="form-group">
                        <label htmlFor="exampleTextarea">Example textarea</label>
                        <ValueField name="tweet">
                            <textarea className="form-control" id="exampleTextarea" rows={3}/>
                        </ValueField>
                    </div>
                    <div className="form-group">
                        <label htmlFor="exampleInputFile">File input</label>
                        <input type="file" className="form-control-file" id="exampleInputFile" aria-describedby="fileHelp"/>
                        <small id="fileHelp" className="form-text text-muted">This is some placeholder block-level help text
                            for
                            the above input. It's a bit lighter and easily wraps to a new line.
                        </small>
                    </div>
                    <fieldset className="form-group">
                        <legend>Radio buttons</legend>
                        <BootstrapRadio name="radio" defaultValue="option1" options={[
                            {value: 'option1', text: "Option one is this and that—be sure to include why it's great"},
                            {value: 'option2', text: "Option two can be something else and selecting it will deselect option one"},
                            {value: 'option3', text: "Option three is disabled", disabled: true},
                        ]}/>
                    </fieldset>
                    <BootstrapCheckbox name="tac">I agree to the <a href="#">Terms & Conditions</a></BootstrapCheckbox>
                    {this.props.data.tac 
                        ? <BootstrapCheckbox name="newsletter" defaultValue={true}>Give me the newsletter</BootstrapCheckbox>
                        : null}
                    <button type="submit" className="btn btn-primary">Submit</button>
                </div>
            </form>
        );
    }
    
    submit = ev => {
        ev.preventDefault();
        if(this.props.validate()) {
            console.log(`Submitting ${JSON.stringify(this.props.data, null, 2)}`);
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const rules = {
    email: [
        Rules.required, 
        Rules.email, 
        Rules.async(email => sleep(1000).then(() => email !== 'mpenner@nucleuslabs.com'), {message: "That email address is already registered"}),
        Rules.async(email => sleep(250).then(() => {
            let atk = getRandomInt(1,20);
            let def = getRandomInt(1,20);
            let errors = [];
            if(atk < 10) {
                errors.push(<span>You rolled a <b>{atk}</b> for attack. Critical miss!</span>);
            }
            if(def < 10) {
                errors.push(<span>You rolled a <b>{def}</b> for defense. Critical hit!</span>);
            }
            return errors;
        })),
    ],
    multiselect: Rules.minLength(3, (v,n) => `Please select ${n-v.length} more items`),
    numberselect: Rules.custom(val => val != '3', {message: "3 is unlucky"}),
    tweet: Rules.maxLength(140,(val,len) => `Please delete ${val.length - len} characters`),
    password: [
        Rules.required,
        Rules.minLength(6),
        Rules.custom(pw => /[^a-z0-9]/i.test(pw), {message: "Please add a special character."}),
        Rules.custom(pw => /[0-9]/i.test(pw), {message: "Please add a number."}),
        Rules.custom(pw => /[A-Za-z]/i.test(pw), {message: "Please add a letter."}),
    ],
    confirmPassword: Rules.custom((val,pw) => val === pw, {dependsOn:['password'],message:"Passwords do not match"}),
    radio: Rules.custom(val => val !== 'option2', {message:"I prefer option two"}),
    tac: Rules.custom(x => x, {message: "You must agree"}),
    
    // multiselect: val => val.length < 3 ? "Please select at least 3 items" : "",
    // numberselect: val => val == '3' ? "3 is unlucky": '',
    // tweet: Rules.maxLength(140).message((val,len) => `Please delete ${val.length - len} characters`),
    // password: [
    //     Rules.required,
    //     Rules.minLength(6),
    //     pw => /[^a-z0-9]/i.test(pw) ? '' : "Please add a special character.",
    //     pw => /[0-9]/i.test(pw) ? '' : "Please add a number.",
    //     pw => /[A-Za-z]/i.test(pw) ? '' : "Please add a letter.",
    //     asyncRule(pw => sleep(1000).then(() => {
    //         if(pw == 'password') return "Password was recently used";
    //     }), "Checking if password was recently used..."),
    // ],
    // confirmPassword: dependantRule(['password'], (val,pw) => val !== pw ? "Passwords do not match" : ''),
    // radio: value => value !== 'option2' ? "I prefer option2" : '',
    // tac: checked => checked ? '' : "You must agree!",
};

// console.log(rules);

module.exports = connectForm({rules})(BootstrapForm);