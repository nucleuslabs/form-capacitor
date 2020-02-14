import FormContext from './FormContext';
import {useContext} from "react";

/**
 * Returns all of the core form capacitor functions and the ready state
 * @returns {{validate: function, set: function, reset: function}}
 */
export default function useFormActions() {
    const {validate, set, reset} = useContext(FormContext);
    return {validate, set, reset};
};