import FormContext from './FormContext';
import {useContext, useEffect, useState} from "react";
import {getFlattenedErrors} from "./errorMapping";
import {autorun} from "mobx";

/**
 * Returns a flattened array of all form errors
 * @returns {[boolean, Object[]]}
 */
export default function useFormErrors() {
    const {errorMap} = useContext(FormContext);
    const [errors, setErrors] = useState(getFlattenedErrors(errorMap));

    useEffect(() => {
        autorun(() => {
            setErrors(getFlattenedErrors(errorMap));
        });
    // }, [errorMap]);
    }, []);     // Basically, we only setup the autorun once (see the empty dependency array), but it acts as the "effect" after that

    return [errors && errors.length > 0, errors];
};
