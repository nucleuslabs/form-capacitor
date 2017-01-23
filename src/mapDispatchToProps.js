const actionTypes = require('./actionTypes');
const {fluxStandardAction} = require('./actionCreators');

module.exports = function mapDispatchToProps(dispatch, {formId,name}) {
    return {
        // dispatch: (actionType, payload) => {
        //     dispatch(fluxStandardAction(actionType, Object.assign({}, payload, {formId,name})));
        // },
        dispatchChange: value => {
            dispatch(fluxStandardAction(actionTypes.CHANGE, {formId,name,value}));
        },
        dispatchFocus: () => {
            dispatch(fluxStandardAction(actionTypes.FOCUS, {formId,name,isFocused:true}));
        },
        dispatchBlur: () => {
            dispatch(fluxStandardAction(actionTypes.FOCUS, {formId,name,isFocused:false}));
        },
        dispatchMouseEnter: () => {
            dispatch(fluxStandardAction(actionTypes.HOVER, {formId,name,isHovering:true}));
        },
        dispatchMouseLeave: () => {
            dispatch(fluxStandardAction(actionTypes.HOVER, {formId,name,isHovering:false}));
        },
        dispatchSubmit: () => {
            dispatch(fluxStandardAction(actionTypes.SUBMIT, {formId}));
        },
    };
};