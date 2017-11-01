import createComponent from '../../createComponent';
import {withDirty} from 'form-capacitor-dirty';
import {mapProps,omitProps,withProps,withPropsOnChange,defaultProps} from 'recompact';
import {FieldLabel} from '../bulma';
// import dump from 'form-capacitor-util/dump';

// console.log(withValue);

export default createComponent({
    displayName: 'DirtyLabel',
    enhancers: [
        withDirty(),
    ],
    render: ({isDirty, ...props}) => (
        <FieldLabel {...props} className={{'is-dirty':isDirty}}/>
    )
})