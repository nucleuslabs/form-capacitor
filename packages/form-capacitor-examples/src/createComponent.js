import {compose} from 'recompact';

export default function createComponent({render, enhancers, displayName, propTypes, defaultProps}) {
    if(enhancers && enhancers.length) {
        if(enhancers.length > 1) {
            render = compose(...enhancers)(render);
        } else {
            render = enhancers[0](render);
        }
    }

    if(process.env.NODE_ENV !== 'production') {
        if(!displayName) {
            console.warn("Don't forget to add a `displayName` to `createComponent`");
        }
        Object.assign(render, {displayName, propTypes});
    }
    
    if(defaultProps) {
        render.defaultProps = defaultProps;
    }
    
    return render;
}