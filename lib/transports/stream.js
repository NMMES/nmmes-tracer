const Transport = require('./default');

module.exports = class Stream extends Transport {
    constructor(options) {
        super(options);
    }
    async _write(string, ops) {
        this.pipe.write(string + '\n');
    }
}
