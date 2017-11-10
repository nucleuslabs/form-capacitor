import {Component, createElement} from 'react'
import {wrapDisplayName} from 'recompose';

export default function onMount(callback) {
    return BaseComponent => {
        class OnMount extends Component {
            constructor(props) {
                super(props);
                callback(this.props);
            }

            render() {
                return createElement(BaseComponent, this.props);
            }
        }

        if(process.env.NODE_ENV !== 'production') {
            OnMount.displayName = wrapDisplayName(BaseComponent, 'onMount');
        }

        return OnMount
    }
}