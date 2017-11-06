import createComponent from '../../createComponent';
import {withDirty} from 'form-capacitor-dirty';
import {withPath} from 'form-capacitor-state';
import {mapProps, omitProps, withProps, withPropsOnChange, defaultProps} from 'recompact';
import {FieldLabel} from '../bulma';
import {toPath} from 'lodash';
import PropTypes from 'prop-types';
// import dump from 'form-capacitor-util/dump';

// console.log(withValue);

export default createComponent({
    displayName: 'DirtyLabel',
    enhancers: [
        withDirty({
            path: p => p.for
        }),
        withPath()
    ],
    propTypes: {
        for: PropTypes.string.isRequired,
        children: PropTypes.node,
    },
    render: ({isDirty, path, ...props}) => {
        if(props.htmlFor === undefined) {
            props.htmlFor = [...path, ...toPath(props.for)].join('.');
        } else if(!props.htmlFor) {
            delete props.htmlFor;
        }
        delete props.for;
        return <FieldLabel {...props} className={{'is-dirty': isDirty}}/>
    }
        
})