const Transport = require('./default');

module.exports = class Console extends Transport {
    constructor(options) {
        super(options);
    }
    async _write(string, ops) {
        console.log(string);
    }
}
