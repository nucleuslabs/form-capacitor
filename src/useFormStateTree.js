import FormContext from './FormContext';
import {useContext, useEffect, useState} from "react";
// import {useObserver} from "mobx-react-lite";
import {autorun} from "mobx";

/**
 * Returns the whole mobx-state-tree for the form including all of it's actions and data
 * Warning this hook uses the useObserverHack and has not been optimized
 * @returns {{}}
 */
export default function useFormStateTree() {
    const {stateTree} = useContext(FormContext);
    // return useObserver(() => stateTree);

    // React18/mobx6: useObserver() is deprecated, and tbqh, none of the API in mobx-react-lite looks like its meant for providing a custom hook in this manner.
    // Replaced with a custom hook leaning on useState, useEffect, and autorun() straight from mobx
    const [currStateTree, setCurrStateTree] = useState(stateTree);

    useEffect(() => {
        autorun(() => {
            setCurrStateTree(stateTree);
        });
    }, [stateTree]);

    return currStateTree;
};