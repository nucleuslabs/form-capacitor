const ReactDOM = require('react-dom');
const ExampleForm = require('./Form1');

ReactDOM.render(<FormProvider>
    <Form1/>
    <Form2 id="myForm"/>
</FormProvider>, document.getElementById('react-root'));