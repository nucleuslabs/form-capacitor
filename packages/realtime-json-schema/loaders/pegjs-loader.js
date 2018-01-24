const peg = require('pegjs');

// https://github.com/pegjs/pegjs/blob/b6bc0d905e8c1a1c9cdb825d03980a06a668f5b8/bin/options.js#L12-L22
// https://pegjs.org/documentation#generating-a-parser-javascript-api
module.exports = function(sourceText) {
    try {
        return peg.generate(sourceText, {
            "--": [],
            "cache": false,
            "dependencies": {},
            "exportVar": null,
            "format": "commonjs",
            "optimize": "speed",
            "output": "source",
            "plugins": [],
            "trace": false
        });
    } catch(err) {
        // TODO: make these errors prettier. maybe use babel-error thingy
        let msg = err.message;
        if(err.location && err.location.start) {
            const loc = err.location.start;
            msg = `[${loc.line}:${loc.column}] ${msg}`;
        }
        throw new Error(msg)
    }
}