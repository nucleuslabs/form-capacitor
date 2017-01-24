const actions = require('./actionCreators');

module.exports = function mapDispatchToProps(dispatch, {form,name}) {
    
    // TODO: nest all of these under 'actions'?
    return {
        dispatchChange: value => {
            dispatch(actions.change(form.id,name,value));
        },
        dispatchFocus: () => {
            dispatch(actions.focus(form.id,name));
        },
        dispatchBlur: () => {
            dispatch(actions.blur(form.id,name));
        },
        dispatchMouseEnter: () => {
            dispatch(actions.mouseEnter(form.id,name));
        },
        dispatchMouseLeave: () => {
            dispatch(actions.mouseLeave(form.id,name));
        },
        dispatchSubmit: () => {
            dispatch(actions.submit(form.id));
        },
    };
};