import {withProps} from '../../lib/react';

import TextBox from './TextBox';
export {default as TextBox} from './TextBox';
export {default as SelectBox} from './SelectBox';
export {default as Radio} from './Radio';
export {default as TextArea} from './TextArea';
export {default as Checkbox} from './Checkbox';
export const TelInput = withProps(TextBox,{type:'tel'});
export const EmailInput = withProps(TextBox,{type:'email'});