const actions = require('./actionCreators');

module.exports = function mapDispatchToProps(dispatch, {formId,name}) {
    
    // TODO: nest all of these under 'actions'?
    return {
        dispatchChange: value => {
            dispatch(actions.change(formId,name,value));
        },
        dispatchFocus: () => {
            dispatch(actions.focus(formId,name));
        },
        dispatchBlur: () => {
            dispatch(actions.blur(formId,name));
        },
        dispatchMouseEnter: () => {
            dispatch(actions.mouseEnter(formId,name));
        },
        dispatchMouseLeave: () => {
            dispatch(actions.mouseLeave(formId,name));
        },
        dispatchSubmit: () => {
            dispatch(actions.submit(formId));
        },
    };
};