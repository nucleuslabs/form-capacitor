// import recompose from 'recompose';
import React from 'react';
import {createEagerFactory, wrapDisplayName,getDisplayName} from 'recompose';

export default function<TProps>(message: string) {
    return (WrappedComponent: React.ComponentType<TProps>) => {

        const factory = createEagerFactory(WrappedComponent);

        return class extends React.PureComponent {
            static displayName = wrapDisplayName(WrappedComponent, 'whyRender');
            
            render() {
                console.info(`"${message||getDisplayName(WrappedComponent)}" rendered`);
                // console.log('withSchema.render',this.props[opt.valueProp]);
                return factory(this.props);
            }
        }
    }
}