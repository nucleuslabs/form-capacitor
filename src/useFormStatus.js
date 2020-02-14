import FormContext from './FormContext';
import {useContext} from "react";
import {useObserver} from "mobx-react-lite";

/**
 * Returns a formStatus observable object which has some boolean props for checking and for ui stuffs
 * Warning this hook uses the useObserverHack and has not been optimized
 * @returns {{ready: boolean, isDirty: boolean, isChanged: boolean, hasErrors: boolean}}
 */
export default function useFormStatus() {
    const {status} = useContext(FormContext);
    return useObserver(() => status);
};