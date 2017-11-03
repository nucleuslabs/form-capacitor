// https://github.com/acdlite/recompose/blob/8c4ac2e4a4cd8d60c8db9bc4cd73f0ce044fd9ca/src/packages/recompose/withPropsOnChange.js
import {createFactory, PureComponent} from 'react'
import {pick} from 'lodash'
import {shallowEqual, setDisplayName, wrapDisplayName} from 'recompact';

const onPropsChange = (shouldMapOrKeys, handler) => BaseComponent => {
    const factory = createFactory(BaseComponent);
    const shouldFire =
        typeof shouldMapOrKeys === 'function'
            ? shouldMapOrKeys
            : (props, nextProps) =>
                !shallowEqual(
                    pick(props, shouldMapOrKeys),
                    pick(nextProps, shouldMapOrKeys)
                );

    class PropsOnChange extends PureComponent {
        componentWillReceiveProps(nextProps) {
            if(shouldFire(this.props, nextProps)) {
                handler(nextProps, this.props);
            }
        }

        render() {
            return factory(this.props)
        }
    }

    if(process.env.NODE_ENV !== 'production') {
        return setDisplayName(wrapDisplayName(BaseComponent, 'onPropsChange'))(
            PropsOnChange
        )
    }
    
    return PropsOnChange
};

export default onPropsChange