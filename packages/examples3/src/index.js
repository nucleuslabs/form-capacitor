import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import {configure} from 'mobx';

configure({
    // enforceActions: true,
    isolateGlobalState: true,
});


ReactDOM.render(<App/>, document.getElementById('react-root'))



// import {observable,toJS} from 'mobx';
//
// let objbox = observable({foo:5});
// // console.log(toJS(objbox));
//
// // console.log(objbox.set);
// // objbox.set({bar:6});
//
// // console.log(objbox.get());
// console.log(objbox.$mobx);
// // console.log(toJS(objbox));