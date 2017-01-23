const actionTypes = require('./actionTypes');

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

exports.change = function(formId, name, value) {
    return fluxStandardAction(actionTypes.CHANGE, {formId,name,value});
};
exports.focus = function(formId, name) {
    return fluxStandardAction(actionTypes.FOCUS, {formId,name,isFocused:true});
};

exports.blur = function(formId, name) {
    return fluxStandardAction(actionTypes.FOCUS, {formId,name,isFocused:false});
};

exports.mouseEnter = function(formId, name) {
    return fluxStandardAction(actionTypes.HOVER, {formId,name,isHovering:true});
};

exports.mouseLeave = function(formId, name) {
    return fluxStandardAction(actionTypes.HOVER, {formId,name,isHovering:false});
};

exports.submit = function(formId) {
    return fluxStandardAction(actionTypes.SUBMIT, {formId});
};