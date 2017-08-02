import {connectForm} from 'form-capacitor';

function PersonForm() {
    
    return (
        <div>
            <div>
                <label>First Name</label>
                <input/>
            </div>
            <div>
                <label>Last Name</label>
                <input/>
            </div>
            <div>
                <label>Age in years</label>
                <input/>
            </div>
        </div>
    )
}

export default connectForm({
    schema: {
        type: 'object',
        properties: {
            firstName: {
                type: 'string',
            },
            lastName: {
                type: 'string',
            },
            age: {
                type: 'integer',
                minimum: 0,
            }
        },
        required: ['firstName', 'lastName'],
    }
})(PersonForm);