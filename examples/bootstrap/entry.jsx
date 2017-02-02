const React = require('react');

if (process.env.NODE_ENV !== 'production') {
    const {whyDidYouUpdate} = require('why-did-you-update');
    whyDidYouUpdate(React)
}

const ReactDOM = require('react-dom');
const BootstrapForm = require('./BootstrapForm');
const OceanicForm = require('./OceanicForm');
const {FormStoreProvider} = require('form-capacitor');

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
                    <h2>Bootstrap Form</h2>
                    <BootstrapForm id="form1"/>
                </div>
                <div className="col-6">
                    <h2>Oceanic Form</h2>
                    <OceanicForm id="form2"/>
                </div>
            </div>
        </div>
    </FormStoreProvider>, 
    document.getElementById('react-root')
);