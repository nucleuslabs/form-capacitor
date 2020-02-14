import FormContext from './FormContext';
import {useContext} from "react";

/**
 * Returns all of the juicy form capacitor stuff most of which are functions formData is a mobx-state-tree, formStatus is an ObservableObject, errorMap is an ObservableMap
 * @returns {{}}
 */
export default function useFormContext() {
    return useContext(FormContext);
};