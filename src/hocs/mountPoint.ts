import {ComponentEnhancer, withContext as setContext} from 'recompose';
import {connect} from 'react-redux';
import {toPath} from 'lodash';
import {contextTypes, getPath, ContextPath, ContextType} from '../context';
import {AnyObject, MapFn} from '../types/misc';
import {resolveValue} from '../util'
import {InferableComponentEnhancerWithProps} from 'recompose';

function getName(props: AnyObject) {
    return props.name;
}

export default function mountPoint<TProps=AnyObject>(mapPropsToName: string|MapFn<TProps, string>=getName) {
    return setContext<ContextType,TProps>(contextTypes, ownProps => {
        // FIXME: this is causing siblings to re-render...
        return {[ContextPath]: [...getPath(ownProps),...toPath(resolveValue(mapPropsToName,ownProps))]};
    })
}