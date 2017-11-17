// inspired by https://github.com/mroderick/PubSubJS/blob/903eb3c45e335ae5bfcda40ae9c5894583869dd8/src/pubsub.js#L168
import {toPath, get as getValue, unset} from 'lodash';
import {setValue,setValueMut} from 'form-capacitor-util/util';
import shortid from 'shortid';
import debounce from '../fast-debounce';

const SUB = Symbol('subscriptions');



export default class Store {
    constructor() {
        this.subscriptions = Object.create(null);
        this.data = Object.create(null);
        // this.counter = 0;



        
        this._fireSubscriptions = (path,context) => {
            // console.log('firrreee',path,context);
            
            let it = this.subscriptions;
            // console.log(it);
            
            console.log('------------------- fire',path.join('.'));

            const fire = (subtree,path) =>{
                
                console.log('running',path.join('.'));

                if(subtree[SUB]) {
                    let currentValue = path.length === 0 ? this.data : getValue(this.data, path);

                    // console.log("SUBBSS")
                    for(let sub of Object.values(subtree[SUB])) {
                        if(!Object.is(currentValue, sub[1])) {
                            // console.log("FIRE ZE MISSILES!!!");
                            sub[0](currentValue, sub[1], context);
                            sub[1] = currentValue;
                        }
                    }
                }
            }
            
            for(let i=0;;) {
              
                
                // console.log(path.slice(0,i).join('.'),currentValue,'|||',it);
                
                // console.log(it);
                
                fire(it, path.slice(0, i));
                
                // if(it[SUB]) {
                //     let currentValue = i === 0 ? this.data : getValue(this.data, path.slice(0, i));
                //    
                //     // console.log("SUBBSS")
                //     for(let sub of Object.values(it[SUB])) {
                //         if(!Object.is(currentValue, sub[1])) {
                //             // console.log("FIRE ZE MISSILES!!!");
                //             sub[0](currentValue, sub[1], context);
                //             sub[1] = currentValue;
                //         }
                //     }
                // }

                // ;
                // console.log('next it',it,path[i]);
              
                // if(++i === path.length) break;
                if(i === path.length) break;
                it = it[path[i]];
                if(!it) break;
                ++i;
            }

            // console.log('this is the end:',it,Object.keys(it));
            //
            if(it) {
                
                const recurse = (tree,path) => {
                    for(let [key, subtree] of Object.entries(tree)) {

                        let p = [...path, key];
                        fire(subtree, p);
                        recurse(subtree, p); // <-- fixme: this should be breadth-first not depth-first
                        
                    }
                };
                
                recurse(it,path);
            }
    
            
            
            
            // let start = performance.now();
            // for(let [k,v] of Object.entries(this.subscriptions)) {
            //     let newValue = getValue(this.data, v[0]);
            //     if(!Object.is(v[2],newValue)) {
            //         // console.log(v[0].join('.'),`${JSON.stringify(v[2])} -> ${JSON.stringify(newValue)}`);
            //         v[1](newValue, v[2], context);
            //         v[2] = newValue;
            //     }
            // }
            // const elapsed = performance.now() - start;
            // console.log('fire subs took',elapsed);
        };
    }

    subscribe(path, callback) {
        path = toPath(path);

        let subKey = shortid();

        let subPath = [...path,SUB,subKey];
        let subTuple = [callback,getValue(this.data,path)];
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
        // TODO: strip undefined values?
        return this.data;
    }
}

