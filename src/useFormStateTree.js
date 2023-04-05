import FormContext from './FormContext';
import {useContext, useEffect, useState} from "react";
import {autorun} from "mobx";

/**
 * Returns the whole mobx-state-tree for the form including all of it's actions and data
 * Warning this hook uses the useObserverHack and has not been optimized
 * @returns {{}}
 */
export default function useFormStateTree() {
    const {stateTree} = useContext(FormContext);
    const [currStateTree, setCurrStateTree] = useState(stateTree);

    useEffect(() => {
        autorun(() => {
            setCurrStateTree(stateTree);
        });
    // }, [stateTree]);
    }, []);     // Basically, we only setup the autorun once (see the empty dependency array), but it acts as the "effect" after that

    return currStateTree;
};
