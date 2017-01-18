const setIn = require('lodash/fp/set');
const actionTypes = require('./actionTypes');

module.exports = function createReducer(initialState) {
    return (state=initialState, action) => {
        let {payload} = action;
        switch(action.type) {
            case actionTypes.CHANGE:
                state = setIn(['forms', payload.formId, 'data', ...toPath(payload.name)], payload.value, state);
                state = setIn(['forms', payload.formId, 'ui', ...toPath(payload.name), 'changed'], true, state);
                break;
            case actionTypes.FOCUS: {
                state = setIn(['forms', payload.formId, 'ui', ...toPath(payload.name), 'focused'], payload.focused, state);
                if(!payload.focused) {
                    state = setIn(['forms', payload.formId, 'ui', ...toPath(payload.name), 'touched'], true, state);
                }
                break;
            }
        }
        return state;
    };
};