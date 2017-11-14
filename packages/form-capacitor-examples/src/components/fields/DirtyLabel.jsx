import createComponent from '../../createComponent';
import {withDirty} from 'form-capacitor-dirty';
import {withPath} from 'form-capacitor-state';
import {mapProps, omitProps, withProps, withPropsOnChange, defaultProps, pure} from 'recompose';
import {FieldLabel} from '../bulma';
import {toPath} from 'lodash';
import PropTypes from 'prop-types';
import withLog from '../../withLog';
// import dump from 'form-capacitor-util/dump';

// console.log(withValue);

export default createComponent({
    displayName: 'DirtyLabel',
    enhancers: [
        withDirty({
            path: p => p.for
        }),
        withPath(),
        // withLog('xxx'),
      
    ],
    propTypes: {
        for: PropTypes.string,
        children: PropTypes.node,
    },
    render: ({isDirty, path, ...props}) => {
        // console.log("im so dirty");
        if(props.htmlFor === undefined) {
            props.htmlFor = [...path, ...toPath(props.for)].join('.');
        } else if(!props.htmlFor) {
            delete props.htmlFor;
        }
        delete props.for;
        return <FieldLabel normal {...props} className={{'is-dirty': isDirty}}/>
    }
})