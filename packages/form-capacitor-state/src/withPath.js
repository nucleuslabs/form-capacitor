import React from 'react';
import {createEagerFactory, wrapDisplayName, shallowEqual} from 'recompact';
import {CTX_KEY_PATH, CTX_VAL_PATH} from 'form-capacitor-store';


export default function withPath(propName = 'path') { // todo: rename getPath?

    return BaseComponent => {
        class WithPath extends React.Component {
            static contextTypes = {
                [CTX_KEY_PATH]: CTX_VAL_PATH,
            };

            render() {
                return React.createElement(BaseComponent, {
                    ...this.props,
                    [propName]: this.context[CTX_KEY_PATH],
                });
            }
        };

        if(process.env.NODE_ENV !== 'production') {
            WithPath.displayName = wrapDisplayName(BaseComponent, 'withPath');
        }

        return WithPath;
    }
};
