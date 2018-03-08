import React from 'react'
import ReactDOM from 'react-dom'
import {AppContainer} from 'react-hot-loader'
import App from './components/App'
import {useStrict} from 'mobx';

useStrict(true);

const render = Component => {
    ReactDOM.render(
        <AppContainer>
            <Component/>
        </AppContainer>,
        document.getElementById('react-root'),
    )
}

render(App)

// Webpack Hot Module Replacement API
if(module.hot) {
    module.hot.accept('./components/App', () => {
        console.clear();
        render(App)
    })
}


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