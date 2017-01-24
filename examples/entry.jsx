const React = require('react');

if (process.env.NODE_ENV !== 'production') {
    const {whyDidYouUpdate} = require('why-did-you-update');
    whyDidYouUpdate(React)
}

const ReactDOM = require('react-dom');
const Form1 = require('./Form1');
const Form2 = require('./Form2');
const FormStoreProvider = require('form-capacitor/FormStoreProvider');

const initialData = {
    form1: {
        email: "mpenner@nucleuslabs.com",
        tweet: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin leo lacus, egestas sed neque ut, sodales sollicitudin tellus. Sed ipsum felis, auctor in velit nec, luctus vulputate nisl."
    }
};

ReactDOM.render(
    <FormStoreProvider data={initialData}>
        <div className="container">
            <h1>Form Capacitor Example</h1>
            <div className="row">
                <div className="col-6">
                    <h2>Form 1</h2>
                    <Form1 id="form1"/>
                </div>
                <div className="col-6">
                    <h2>Form 2</h2>
                    <Form2 id="form2"/>
                </div>
            </div>
        </div>
    </FormStoreProvider>, 
    document.getElementById('react-root')
);