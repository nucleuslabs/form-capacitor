import FormContext from './FormContext';
import {useContext, useEffect, useState} from "react";
// import {useObserver} from "mobx-react-lite";
import {autorun} from "mobx";

/**
 * Returns a formStatus observable object which has some boolean props for checking and for ui stuffs
 * Warning this hook uses the useObserverHack and has not been optimized
 * @returns {{ready: boolean, isDirty: boolean, isChanged: boolean, hasErrors: boolean}}
 */
export default function useFormStatus() {
    const {status} = useContext(FormContext);
    // return useObserver(() => status);

    // React18/mobx6: useObserver() is deprecated, and tbqh, none of the API in mobx-react-lite looks like its meant for providing a custom hook in this manner.
    // Replaced with a custom hook leaning on useState, useEffect, and autorun() straight from mobx
    const [currStatus, setCurrStatus] = useState(status);

    useEffect(() => {
        autorun(() => {
            setCurrStatus(status);
        });
    }, [status]);

    return currStatus;
};