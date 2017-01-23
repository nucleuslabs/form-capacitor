const setIn = require('lodash/fp/set');
const actionTypes = require('./actionTypes');
const namespace = require('./namespace');
const toPath = require('lodash/toPath');

module.exports = function createReducer(data) {
    let initialState = {};
    
    for(let formId of Object.keys(data)) {
        initialState[formId] = {
            data: data[formId],
            initial: data[formId],
        }
    }
    
    return (state = {[namespace]: initialState}, action) => {
        let {payload} = action;
        switch(action.type) {
            case actionTypes.CHANGE:
                state = setIn([namespace, payload.formId, 'data', ...toPath(payload.name)], payload.value, state);
                state = setIn([namespace, payload.formId, 'ui', ...toPath(payload.name), 'wasChanged'], true, state);
                break;
            case actionTypes.FOCUS: {
                state = setIn([namespace, payload.formId, 'ui', ...toPath(payload.name), 'isFocused'], payload.isFocused, state);
                if(payload.isFocused) {
                    state = setIn([namespace, payload.formId, 'ui', ...toPath(payload.name), 'wasFocused'], true, state);
                } else if(!payload.isFocused) {
                    state = setIn([namespace, payload.formId, 'ui', ...toPath(payload.name), 'wasBlurred'], true, state);
                }
                break;
            }
            case actionTypes.HOVER: {
                state = setIn([namespace, payload.formId, 'ui', ...toPath(payload.name), 'isHovering'], payload.isHovering, state);
                if(payload.isHovering) {
                    state = setIn([namespace, payload.formId, 'ui', ...toPath(payload.name), 'mouseEntered'], true, state);
                } else if(!payload.isHovering) {
                    state = setIn([namespace, payload.formId, 'ui', ...toPath(payload.name), 'mouseLeft'], true, state);
                }
                break;
            }
            case actionTypes.SUBMIT: {
                state = setIn([namespace, payload.formId, 'submitted'], true, state);
                break;
            }
        }
        return state;
    };
};

/*
const ui = {
    isDirty: true, // value is different from initial state
    wasChanged: true, // value was changed
    isEmpty: true, // value is same as default value
    isFocused: true, // input is focused
    wasFocused: true,  // input was focused
    wasBlurred: true, // input lost focus
    isValid: true, // input has no validation errors
    isHovering: true, // mouse is over input
    mouseEntered: true, // mouse was over input
    mouseLeft: true, // mouse entered input and then left
    wasSubmitted: true, // form submit was attempted while this input existed
    wasValid: true, // input was at some point valid
};
*/