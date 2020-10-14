import React from "react";
import RequiredFieldDoesNotExistError from "./errorTypes/RequiredFieldDoesNotExistError";
import DependencySchemaDoesNotExistError from "./errorTypes/DependencySchemaDoesNotExistError";

/**
 * Returns a component that renders an error message
 * @param {{}} props
 * @returns {React.Component}
 */
export default function FormError({error, message}) {
    if(error instanceof RequiredFieldDoesNotExistError) {
        return <div>
            <div>The property <strong>{error.propName}</strong> is set as required but it does not exist in the provided schema:</div>
            <blockquote>
                <pre>
                    {JSON.stringify(error.schema, null, 2)}
                </pre>
            </blockquote>
        </div>;
    } else if(error instanceof DependencySchemaDoesNotExistError) {
        return <div>
            <div>The property <strong>{error.propName}</strong> is referenced in dependencies but it does not exist in the provided schema:</div>
            <blockquote>
                <pre>
                    {JSON.stringify(error.schema, null, 2)}
                </pre>
            </blockquote>
        </div>;
    } else {
        return <div>{message}</div>;
    }
};