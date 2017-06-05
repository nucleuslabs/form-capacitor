import actionTypes from './actionTypes';

/**
 * Creates a flux standard action.
 *
 * @param {string} type Identifies to the consumer the nature of the action that has occurred.
 * @param {*=} payload The payload of the action.
 * @param {*=} meta Extra information that is not part of the payload.
 * @returns {Object} Action object.
 * @see https://github.com/acdlite/flux-standard-action
 */
function fluxStandardAction(type, payload, meta) {
    let action = {type};
    action.payload = payload;
    if(payload instanceof Error) {
        action.error = true;
    }
    if(meta !== undefined) {
        action.meta = meta;
    }
    return action;
}

export function change(formId, name, value) {
    return fluxStandardAction(actionTypes.CHANGE, {formId,name,value});
}

export function focus(formId, name) {
    return fluxStandardAction(actionTypes.FOCUS, {formId,name,isFocused:true});
}

export function blur(formId, name) {
    return fluxStandardAction(actionTypes.FOCUS, {formId,name,isFocused:false});
}

export function mouseEnter(formId, name) {
    return fluxStandardAction(actionTypes.HOVER, {formId,name,isHovering:true});
}

export function mouseLeave(formId, name) {
    return fluxStandardAction(actionTypes.HOVER, {formId,name,isHovering:false});
}

export function submit(formId) {
    return fluxStandardAction(actionTypes.SUBMIT, {formId});
}

export function asyncValidation(formId, name, complete) {
    return fluxStandardAction(actionTypes.ASYNC_VALIDATION, {formId, name, complete});
}

export function saveState(formId, data) {
    return fluxStandardAction(actionTypes.SAVE_STATE, {formId, data});
}