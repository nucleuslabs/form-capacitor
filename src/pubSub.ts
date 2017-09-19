// inspired by https://github.com/mroderick/PubSubJS/blob/903eb3c45e335ae5bfcda40ae9c5894583869dd8/src/pubsub.js#L168

class PubSub {
    private subscriptions = Object.create(null);
    private counter = 0;

    subscribe(path, callback) {
        if(Array.isArray(path)) {
            path = path.join('.');
        }
        
        let key = this.counter++;
        
        if(!this.subscriptions[path]) {
            this.subscriptions[path] = Object.create(null);
        }

        this.subscriptions[path][key] = callback;
        
        return () => {
            delete this.subscriptions[path][key];
        }
    }
    
    publish(path) {
        if(Array.isArray(path)) {
            path = [...path];
        } else {
            path = path.split('.');
        }
        
        do {
            let subPath = path.join('.');
            if(this.subscriptions[subPath]) {
                for(let cb of Object.values(this.subscriptions[subPath])) {
                    cb();
                }
            }
            path.pop();
        } while(path.length);
    }
}

export default new PubSub();