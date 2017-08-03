// import recompose from 'recompose';
import {JsonSchema} from '../types/json-schema';
import {MapFn} from '../types/misc';


export default function withSchema<TProps>(schema: JsonSchema|MapFn<TProps, JsonSchema>) {

    return (WrappedComponent: React.ComponentType<TProps>) => {
        return WrappedComponent;
    }
}