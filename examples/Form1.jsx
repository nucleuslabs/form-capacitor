const {FormProvider, Rules} = require('form-capacitor');
const ValueField = require('./ValueField');
const BootstrapRadio = require('./BootstrapRadio');
const SubmitButton = require('./SubmitButton');

const validationRules = {
    tweet: Rules.maxLength(140).message((val,len) => `Please delete ${val.length - len} characters`),
    password: [
        Rules.required,
        Rules.minLength(6),
        pw => /[^a-z0-9]/i.test(pw) ? '' : "Please add a special character.",
        pw => /[0-9]/i.test(pw) ? '' : "Please add a number.",
        pw => /[A-Za-z]/i.test(pw) ? '' : "Please add a letter.",
    ],
    radio: value => value !== 'option2' ? "I prefer option2" : '',
};

function getMultiVal(ev) {
    return Array.from(ev.target.options).filter(o => o.selected).map(o => o.value);
}

module.exports = function Form1({id}) {
    return (
        <FormProvider id={id} rules={validationRules}>
            <div className="bd-example">
                <div className="form-group">
                    <label htmlFor="exampleInputEmail1">Email address</label>
                    <ValueField name="email" rules={[Rules.required, Rules.email]}>
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
                    <label htmlFor="exampleSelect1">Example select</label>
                    <ValueField name="number-select" rules={val => val == '3' ? "3 is unlucky": ''}>
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

                    <ValueField name="multi-select" rules={val => val.length < 3 ? "Please select at least 3 items" : ""} defaultValue={[2,3]} valueGetter={getMultiVal}>
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
                <div className="form-check">
                    <label className="form-check-label">
                        <input type="checkbox" className="form-check-input"/>
                        Check me out
                    </label>
                </div>
                <SubmitButton>Submit</SubmitButton>
            </div>
        </FormProvider>
    );
};