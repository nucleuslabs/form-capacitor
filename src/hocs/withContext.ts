import {contextTypes} from '../context';
import {getContext} from 'recompose';

const hasContext = Symbol('hasContext');

export default function withContext() {
    return BaseComponent => {
        if(BaseComponent[hasContext]) {
            return BaseComponent;
        }
        return getContext(contextTypes)(BaseComponent);
    }
}