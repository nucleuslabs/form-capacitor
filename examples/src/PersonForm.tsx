import React from 'react';
// import {connectForm} from 'form-capacitor';

export default function PersonForm() {

    return (
        <div className="form-horizontal">
            <h1>Person Form</h1>
            <div className="form-group">
                <label className="col-sm-2 control-label">First Name</label>
                <div className="col-sm-10">
                    <input className="form-control"/>
                </div>
            </div>
            <div className="form-group">
                <label className="col-sm-2 control-label">Last Name</label>
                <div className="col-sm-10">
                    <input className="form-control"/>
                </div>
            </div>
            <div className="form-group">
                <label className="col-sm-2 control-label">Age in years</label>
                <div className="col-sm-10">
                    <input className="form-control"/>
                </div>
            </div>
        </div>
    )
}

// export default connectForm({
//     schema: {
//         type: 'object',
//         properties: {
//             firstName: {
//                 type: 'string',
//             },
//             lastName: {
//                 type: 'string',
//             },
//             age: {
//                 type: 'integer',
//                 minimum: 0,
//             }
//         },
//         required: ['firstName', 'lastName'],
//     }
// })(PersonForm);