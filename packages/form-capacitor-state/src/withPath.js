import React from 'react';
import {createEagerFactory, wrapDisplayName, shallowEqual} from 'recompact';
import {CTX_KEY_PATH, CTX_VAL_PATH} from 'form-capacitor-store';


export default function withPath(options) { // todo: rename getPath?

    options = {
        pathProp: 'path',
        ...options,
    };

    return BaseComponent => {
        const factory = createEagerFactory(BaseComponent);

        return class extends React.PureComponent {
            static displayName = wrapDisplayName(BaseComponent, 'withPath');

            static contextTypes = {
                [CTX_KEY_PATH]: CTX_VAL_PATH,
            };
            
            render() {
                return factory({
                    ...this.props,
                    [options.pathProp]: this.context[CTX_KEY_PATH],
                });
            }
        }
    }
};
