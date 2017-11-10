// https://github.com/acdlite/recompose/blob/8c4ac2e4a4cd8d60c8db9bc4cd73f0ce044fd9ca/src/packages/recompose/withPropsOnChange.js
// see also https://www.npmjs.com/package/@hocs/with-callback-on-change
import {createElement, Component} from 'react'
import {pick} from 'lodash'
import {shallowEqual, setDisplayName, wrapDisplayName} from 'recompose';

const onPropsChange = (shouldMapOrKeys, handler) => BaseComponent => {
    const shouldFire =
        typeof shouldMapOrKeys === 'function'
            ? shouldMapOrKeys
            : (props, nextProps) =>
                !shallowEqual(
                    pick(props, shouldMapOrKeys),
                    pick(nextProps, shouldMapOrKeys)
                );

    class OnPropsOnChange extends Component {
        componentWillReceiveProps(nextProps) {
            // console.warn('got new props',JSON.stringify(this.props.value,null,2),JSON.stringify(nextProps.value,null,2),shallowEqual(this.props,nextProps));
            if(shouldFire(this.props, nextProps)) {
                handler(nextProps, this.props);
            }
        }

        render() {
            return createElement(BaseComponent, this.props);
        }
    }

    if(process.env.NODE_ENV !== 'production') {
        OnPropsOnChange.displayName = wrapDisplayName(BaseComponent, 'onPropsChange');
    }
    
    return OnPropsOnChange
};

export default onPropsChange