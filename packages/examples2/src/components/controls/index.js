import {withProps} from '../../lib/react';

import TextBox from './TextBox';
export {default as TextBox} from './TextBox';
export {default as SelectBox} from './SelectBox';
export {default as Radio} from './Radio';
export const TelInput = withProps(TextBox,{type:'tel'});
export const EmailInput = withProps(TextBox,{type:'email'});