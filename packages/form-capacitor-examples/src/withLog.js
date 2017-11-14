// yoinked from https://github.com/deepsweet/hocs/blob/master/packages/with-log/src/index.js
/* eslint-disable no-console */
import { createElement } from 'react'
import { setDisplayName, wrapDisplayName } from 'recompose'
import {resolveValue} from '../../form-capacitor-util/util';

const withLog = (getMessageToLog = (props) => props) => (Target) => {
    if (process.env.NODE_ENV === 'production') {
        return Target
    }

    const displayName = wrapDisplayName(Target, 'withLog')
    const WithLog = (props) => {
        console.log(`${displayName}:`, resolveValue(getMessageToLog,props))

        return createElement(Target, props)
    }

    return setDisplayName(displayName)(WithLog)
}

export default withLog