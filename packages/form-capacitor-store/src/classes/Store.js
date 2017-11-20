// inspired by https://github.com/mroderick/PubSubJS/blob/903eb3c45e335ae5bfcda40ae9c5894583869dd8/src/pubsub.js#L168
import {toPath, unset} from 'lodash';
import {setValue,setValueMut,getValue} from 'form-capacitor-util/util';
import shortid from 'shortid';
import debounce from '../fast-debounce';

const SUB = Symbol('subscriptions');



export default class Store {
    constructor() {
        this.subscriptions = Object.create(null);
        this.data = Object.create(null);
        
        this._fireSubscriptions = (path,context) => {
            // console.log('fire',path.join('.'));
  
            let it = this.subscriptions;

            // console.log('------------------- fire',path.join('.'));
            const runSubsAtPath = (subtree,path) =>{
                
                // console.log('running',path.join('.'));

                if(subtree[SUB]) {
                    let currentValue = getValue(this.data, path);
                    
                    for(let sub of Object.values(subtree[SUB])) {
                        if(!Object.is(currentValue, sub[1])) {
                            sub[0](currentValue, sub[1], context);
                            sub[1] = currentValue;
                        }
                    }
                }
            };
            
            for(let i=0;;) {
                runSubsAtPath(it, path.slice(0, i));
                if(i === path.length) break;
                it = it[path[i]];
                if(!it) break;
                ++i;
            }

  
            if(it) {
                
                const recurse = (tree,path) => {
                    for(let [key, subtree] of Object.entries(tree)) {

                        let p = [...path, key];
                        runSubsAtPath(subtree, p);
                        recurse(subtree, p); // <-- fixme: this should be breadth-first not depth-first
                        
                    }
                };
                
                recurse(it,path);
            }
        };
    }

    subscribe(path, callback) {
        path = toPath(path);

        let subKey = shortid();

        let subPath = [...path,SUB,subKey];
        let subTuple = [callback,getValue(this.data,path)]; // <--- fixme: do we need to store the value here or can we store it once per node??
        setValueMut(this.subscriptions, subPath, subTuple);


        // console.log(this.subscriptions);

        // this.subscriptions[subKey] = [path,callback,getValue(this.data,path)];

        const unsub = () => {
            unset(this.subscriptions, subPath);
        };
        // unsub.key = subKey;
        return unsub;
    }

    get(path) {
        return getValue(this.data, path);
    }

    unset(path) {
        if(unset(this.data, path)) {
            this._fireSubscriptions(path);
        }
    }

    set(path, value, context) {
        path = toPath(path);
        let oldValue = getValue(this.data, path);
        if(typeof value === 'function') {
            value = value(oldValue);
        }
        if(Object.is(oldValue, value)) return;
        setValue(this.data, path, value);
        this._fireSubscriptions(path, context);
    }

    toJSON() {
        return this.data;
    }
}

