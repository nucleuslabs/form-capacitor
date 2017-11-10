// https://github.com/acdlite/recompose/blob/8c4ac2e4a4cd8d60c8db9bc4cd73f0ce044fd9ca/src/packages/recompose/withPropsOnChange.js
import {createFactory, Component} from 'react'
import {pick} from 'lodash'
import {shallowEqual, setDisplayName, wrapDisplayName} from 'recompose';

const withPropsOnChange = (shouldMapOrKeys, propsMapper) => BaseComponent => {
    const factory = createFactory(BaseComponent);
    const shouldMap =
        typeof shouldMapOrKeys === 'function'
            ? shouldMapOrKeys
            : (props, nextProps) =>
                !shallowEqual(
                    pick(props, shouldMapOrKeys),
                    pick(nextProps, shouldMapOrKeys)
                );

    class WithPropsOnChange extends Component {
        computedProps = propsMapper(this.props, this.props);

        componentWillReceiveProps(nextProps) {
            console.log('yoyoyyo',this.props,nextProps);
            if(shouldMap(this.props, nextProps)) {
                this.computedProps = propsMapper(nextProps, this.props);
            }
        }

        render() {
            return factory({
                ...this.props,
                ...this.computedProps,
            })
        }
    }

    if(process.env.NODE_ENV !== 'production') {
        return setDisplayName(wrapDisplayName(BaseComponent, 'withPropsOnChange'))(
            WithPropsOnChange
        )
    }
    return WithPropsOnChange
}

export default withPropsOnChange;