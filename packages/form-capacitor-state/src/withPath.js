import React from 'react';
import {createEagerFactory, wrapDisplayName, shallowEqual} from 'recompact';
import {ContextPath, PathShape} from 'form-capacitor-store';


export default function withPath(options) {

    options = {
        pathProp: 'path',
        ...options,
    };

    return BaseComponent => {
        const factory = createEagerFactory(BaseComponent);

        return class extends React.PureComponent {
            static displayName = wrapDisplayName(BaseComponent, 'withPath');

            static contextTypes = {
                [ContextPath]: PathShape,
            };
            
            render() {
                return factory({
                    ...this.props,
                    [options.pathProp]: this.context[ContextPath],
                });
            }
        }
    }
};
