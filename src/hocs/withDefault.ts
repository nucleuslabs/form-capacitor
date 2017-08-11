import {wrapDisplayName} from 'recompose';

export default function withDefault(value) {
    return BaseComponent => class WithDefault extends BaseComponent {
        static displayName = wrapDisplayName("withDefault");
        
        constructor(props) {
            super(props);
            props.dispatch([], value);
        }
    }
}