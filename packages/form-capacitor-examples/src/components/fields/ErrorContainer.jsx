import createComponent from '../../createComponent';
import {omitProps} from 'recompose';
import cc from 'classcat';
import {withErrors} from 'form-capacitor-schema';
import {withPath} from '../../../../form-capacitor-state/src';

export default createComponent({
    displayName: 'ErrorContainer',
    enhancers: [
        withPath(),
        withErrors(),
    ],
    propTypes: {
   
    },
    render: ({errors,className,children}) => {
        const hasErrors = !!(errors && errors.length);
        return (
            <fieldset className={cc(['error-container',className,{'is-danger':hasErrors}])} children={children}/>
        )
    }
})