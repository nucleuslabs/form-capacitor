import FormContext from './FormContext';
import {useContext, useEffect, useState} from "react";
import {autorun} from "mobx";

/**
 * Returns a formStatus observable object which has some boolean props for checking and for ui stuffs
 * Warning this hook uses the useObserverHack and has not been optimized
 * @returns {{ready: boolean, isDirty: boolean, isChanged: boolean, hasErrors: boolean}}
 */
export default function useFormStatus() {
    const {status} = useContext(FormContext);
    const [currStatus, setCurrStatus] = useState(status);

    useEffect(() => {
        autorun(() => {
            setCurrStatus(status);
        });
    // }, [status]);
    }, []);     // Basically, we only setup the autorun once (see the empty dependency array), but it acts as the "effect" after that

    return currStatus;
};
