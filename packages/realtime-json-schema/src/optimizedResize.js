// https://developer.mozilla.org/en-US/docs/Web/Events/resize

function throttleEvent(type, name, obj) {
    obj = obj || window;
    let running = false;
    const func = function() {
        if (running) { return; }
        running = true;
        requestAnimationFrame(function() {
            obj.dispatchEvent(new CustomEvent(name));
            running = false;
        });
    };
    obj.addEventListener(type, func);
}

throttleEvent('resize', 'optimizedResize');
