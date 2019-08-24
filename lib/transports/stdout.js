const rl = require('readline');
const Transport = require('./default');

module.exports = class Stdout extends Transport {
    constructor(options) {
        super(options);
    }
    async _write(string, ops) {
        if (ops.replace && this._last.ops.id === ops.id) {
            rl.moveCursor(process.stdout, 0, -1);
            rl.clearLine(process.stdout, 0);
        }
        process.stdout.write(string + '\n');
    }
}
