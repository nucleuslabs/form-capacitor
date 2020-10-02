import React from "react";
/**
 * Returns a component that renders an error message
 * @param {{message: string}} props
 * @returns {React.Component}
 */
export default function FormError({message}) {
    return <div>{message}</div>;
};