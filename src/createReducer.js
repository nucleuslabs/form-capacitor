const setIn = require('lodash/fp/set');
const actionTypes = require('./actionTypes');
const rootProp = 'forms'; // should this maybe be "form-capacitor"?

module.exports = function createReducer(initialState) {
    return (state = {[rootProp]: initialState}, action) => {
        let {payload} = action;
        switch(action.type) {
            case actionTypes.CHANGE:
                state = setIn([rootProp, payload.formId, 'data', ...toPath(payload.name)], payload.value, state);
                state = setIn([rootProp, payload.formId, 'ui', ...toPath(payload.name), 'changed'], true, state);
                break;
            case actionTypes.FOCUS: {
                state = setIn([rootProp, payload.formId, 'ui', ...toPath(payload.name), 'focused'], payload.focused, state);
                if(!payload.focused) {
                    state = setIn([rootProp, payload.formId, 'ui', ...toPath(payload.name), 'touched'], true, state);
                }
                break;
            }
        }
        return state;
    };
};