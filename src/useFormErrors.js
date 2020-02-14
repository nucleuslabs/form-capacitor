import FormContext from './FormContext';
import {useContext} from "react";
import {getFlattenedErrors} from "./errorMapping";
import {useObserver} from "mobx-react-lite";

/**
 * Returns a flattened array of all form errors
 * @returns {[boolean, Object[]]}
 */
export default function useFormErrors() {
    const {errorMap} = useContext(FormContext);
    return useObserver(() => {
        const errors = getFlattenedErrors(errorMap);
        return [errors && errors.length > 0, errors];
    });
};