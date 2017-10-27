import util from 'util';

export default function dump(...args) {
    console.log(...args.map(o => util.inspect(o, {colors: true})));
}
