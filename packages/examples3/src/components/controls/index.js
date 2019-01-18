import {withProps} from '../../lib/react';
import {default as TB} from './TextBox';

export {default as TextBox} from './TextBox';
export {default as Select} from './Select';
export {default as ReactSelect} from './ReactSelect';
export {default as ReactMultiSelect} from './ReactMultiSelect';
export {default as RadioMenu} from './RadioMenu';
export {default as TextArea} from './TextArea';
export {default as Checkbox} from './Checkbox';
export const TelInput = withProps(TB,{type:'tel'});
export const EmailInput = withProps(TB,{type:'email'});