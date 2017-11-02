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
            name: p => p.for
        }),
        withPath()
    ],
    propTypes: {
        for: PropTypes.string.isRequired,
        children: PropTypes.node,
    },
    render: ({isDirty, path, ...props}) => {
        props.htmlFor = [...path, ...toPath(props.for)].join('.');
        delete props.for;
        return <FieldLabel {...props} className={{'is-dirty': isDirty}}/>
    }
        
})