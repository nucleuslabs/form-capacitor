import FormContext from './FormContext';
import {useContext} from "react";
import {useObserver} from "mobx-react-lite";

/**
 * Returns the whole mobx-state-tree for the form including all of it's actions and data
 * Warning this hook uses the useObserverHack and has not been optimized
 * @returns {{}}
 */
export default function useFormStateTree() {
    const {stateTree} = useContext(FormContext);
    return useObserver(() => stateTree);
};