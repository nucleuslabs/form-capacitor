import FormContext from './FormContext';
import {useContext, useEffect, useState} from "react";
import {getFlattenedErrors} from "./errorMapping";
// import {useObserver} from "mobx-react-lite";
import {autorun} from "mobx";

/**
 * Returns a flattened array of all form errors
 * @returns {[boolean, Object[]]}
 */
export default function useFormErrors() {
    const {errorMap} = useContext(FormContext);
    // return useObserver(() => {
    //     const errors = getFlattenedErrors(errorMap);
    //     return [errors && errors.length > 0, errors];
    // });

    // React18/mobx6: useObserver() is deprecated, and tbqh, none of the API in mobx-react-lite looks like its meant for providing a custom hook in this manner.
    // Replaced with a custom hook leaning on useState, useEffect, and autorun() straight from mobx
    const [errors, setErrors] = useState(getFlattenedErrors(errorMap));

    useEffect(() => {
        autorun(() => {
            setErrors(getFlattenedErrors(errorMap));
        });
    }, [errorMap]);

    return [errors && errors.length > 0, errors];
};