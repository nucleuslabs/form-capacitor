import {wrapDisplayName} from 'recompose';
import {toClass} from 'recompose';

export default function withDefault(value) {
    return (BaseComponent: React.ComponentType) => class WithDefault extends toClass(BaseComponent) {
        static displayName = wrapDisplayName(BaseComponent, "withDefault");

        constructor(props) {
            super(props);
            props.dispatch([], value);
        }
    }
}