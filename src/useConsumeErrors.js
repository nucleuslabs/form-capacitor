import FormContext from './FormContext';
import {toPath, getErrorsByPath} from './helpers';
import {useObserver} from "mobx-react-lite";
import {useContext} from "react";

/**
 * Returns the stored value for this component and a function to set the value
 * @param {string | string[]} path
 * @returns {[Boolean, Array | null]}
 */
export default function useConsumeErrors(path) {
    const context = useContext(FormContext);
    const fullPath = [...context.path, ...toPath(path)];
    return useObserver(() => {
        const errors = getErrorsByPath(context.errorMap, fullPath);
        return [errors && errors.length > 0, errors];
    }
    );
};