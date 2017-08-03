import {withProps, mapProps} from 'recompose';
import {InferableComponentEnhancerWithProps} from 'recompose';

export interface ConnectOptions {
    valueName?: string,
    dispatchName?: string,
}

export default function connectField({
                                         valueName = 'value',
                                         dispatchName = 'dispatch'
                                     }: ConnectOptions) {

    return withProps(ownerProps => ({
        [valueName]: null,
        [dispatchName]: null,
    }));
}