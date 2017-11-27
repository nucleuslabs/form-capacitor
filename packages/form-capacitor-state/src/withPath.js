import React from 'react';
import {createEagerFactory, wrapDisplayName, shallowEqual} from 'recompact';
import {CTX_KEY_PATH, CTX_VAL_PATH} from 'form-capacitor-store';
import mount from './mount';

export default function withPath(propName = 'path') { // todo: rename getPath?

    return mount({
        add: false,
        mount: false,
        expose: propName,
    });
};
