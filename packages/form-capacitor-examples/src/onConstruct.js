import {Component, createElement} from 'react'
import {wrapDisplayName} from 'recompose';

export default function onConstruct(callback) {
    return BaseComponent => {
        class OnConstruct extends Component {
            constructor(props) {
                super(props);
                callback(this.props);
            }

            render() {
                return createElement(BaseComponent, this.props);
            }
        }

        if(process.env.NODE_ENV !== 'production') {
            OnConstruct.displayName = wrapDisplayName(BaseComponent, 'onConstruct');
        }

        return OnConstruct
    }
}