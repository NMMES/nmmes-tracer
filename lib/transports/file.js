const Transport = require('./default');
const stripAnsi = require('strip-ansi');
const fs = require('fs');
const util = require('util');
const fswrite = util.promisify(fs.write);

// TODO: Rotating log, log compression, fs.truncate to remove last line
module.exports = class File extends Transport {
    constructor(options) {
        super(Object.assign({}, {path: 'output.log'}, options));
        this.fd = fs.openSync(this.options.path, 'a');
    }
    async _write(string, ops, details) {
        const stripped = stripAnsi(string);
        await fswrite(this.fd, stripped + '\n');
    }
}
