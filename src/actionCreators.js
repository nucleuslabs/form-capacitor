/**
 * Creates a flux standard action.
 *
 * @param {string} type Identifies to the consumer the nature of the action that has occurred.
 * @param {*=} payload The payload of the action.
 * @param {*=} meta Extra information that is not part of the payload.
 * @returns {Object} Action object.
 * @see https://github.com/acdlite/flux-standard-action
 */
exports.fluxStandardAction = function fluxStandardAction(type, payload, meta) {
    let action = {type};
    action.payload = payload;
    if(payload instanceof Error) {
        action.error = true;
    }
    if(meta !== undefined) {
        action.meta = meta;
    }
    return action;
};
