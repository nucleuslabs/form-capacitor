import {Component} from 'react'
import {createEagerFactory, wrapDisplayName} from 'recompose';
import {mapValues} from './util';
import {resolveValue} from '../../src/util';
import {MapFn} from '../../src/types/misc';

export interface Handlers {
    [x: string]: (...args: any[]) => void
}

const withHigherHandlers = <TProps extends {}>(handlers: Handlers|MapFn<TProps,Handlers>): React.ComponentClass<TProps> => (BaseComponent: React.ComponentType<TProps>) => {
    const factory = createEagerFactory(BaseComponent);

    class WithHigherHandlers extends Component {
        static displayName = wrapDisplayName(BaseComponent, 'withHigherHandlers');

        handlers = mapValues(
            resolveValue(handlers, this.props),
            (handler, handlerName) => (...args1) => (...args2) => {
                return handler(...args1, this.props, ...args2); // TODO: memoize this somehow?
            }
        );

        render() {
            return factory({
                ...this.props,
                ...this.handlers,
            })
        }
    }


    return WithHigherHandlers
};

export default withHigherHandlers;