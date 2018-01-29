// https://developer.mozilla.org/en-US/docs/Web/Events/resize

function throttleEvent(type, name, options) {
    let running = false;
    const func = () => {
        if (running) { return; }
        running = true;
        requestAnimationFrame(() => {
            this.dispatchEvent(new CustomEvent(name));
            running = false;
        });
    };
    this.addEventListener(type, func, options);
}

window::throttleEvent('resize', 'optimizedResize', {passive:true});
