const ReactDOM = require('react-dom');
const Form1 = require('./Form1');
const Form2 = require('./Form2');
const FormProvider = require('../src/FormProvider');

ReactDOM.render(<FormProvider>
    <div>
        <Form1/>
        <Form2 id="myForm"/>
    </div>
</FormProvider>, document.getElementById('react-root'));