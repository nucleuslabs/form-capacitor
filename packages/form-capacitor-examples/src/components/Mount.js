import createComponent from '../createComponent';
import {mountPoint} from 'form-capacitor-state';

export default createComponent({
   displayName: 'Mount',
   enhancers: mountPoint({
       add: p => p.path,
       expose: p => p.expose === undefined || p.expose,
   })
});