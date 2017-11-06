// inspired by https://github.com/mroderick/PubSubJS/blob/903eb3c45e335ae5bfcda40ae9c5894583869dd8/src/pubsub.js#L168
import {toPath, get as getValue, unset} from 'lodash';
import {setValue} from 'form-capacitor-util/util';

export default class Store {
    constructor() {
        this.subscriptions = Object.create(null);
        this.data = Object.create(null);
        this.counter = 0;
    }

    _fireSubscriptions(omitKey) {
        for(let [k,v] of Object.entries(this.subscriptions)) {
            if(k === omitKey) continue;
            let newValue = getValue(this.data, v[0]);
            if(!Object.is(v[2],newValue)) {
                v[2] = newValue;
                v[1](newValue,v[2]);
            }
        }
    }

    subscribe(path, callback) {
        path = toPath(path);
        let key = this.counter++;
        this.subscriptions[key] = [path,callback,getValue(this.data,path)];

        const unsub = () => {
            delete this.subscriptions[key];
        };
        unsub.key = key;
        return unsub;
    }
    
    get(path) {
        return getValue(this.data, path);
    }
    
    unset(path) {
        if(unset(this.data, path)) {
            this._fireSubscriptions();
        }
    }

    set(path, value, omitKey) {
        path = toPath(path);
        let oldValue = getValue(this.data, path);
        if(Object.is(oldValue, value)) return;
        setValue(this.data, path, value);
        this._fireSubscriptions(omitKey);
    }
    
    toJSON() {
        // TODO: strip undefined values?
        return this.data;
    }
}

