const Transport = require('./default');

module.exports = class Raw extends Transport {
    constructor(options) {
        super(options);
        this._write = options.function;
    }
}
