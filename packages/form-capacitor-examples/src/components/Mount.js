import createComponent from '../createComponent';
import {mount} from 'form-capacitor-state';

export default createComponent({
   displayName: 'Mount',
   enhancers: mount({
       add: p => p.path,
       expose: p => p.expose === undefined || p.expose,
   })
});