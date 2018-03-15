const dot = require('dot');
const util = require('util');

const defaults = {
    _lastOps: {},
    _queue: []
};

module.exports = class Transport {
    constructor(options) {
        this.options = options;
    }
    set format(format) {
        this._format = format;
        this._formatter = new Proxy({}, {
            get: (obj, prop) => {
                if (prop in obj) {
                    return obj[prop];
                }
                return obj._default || this.logger._formatter[prop];
            }
        });
        if (typeof format === 'string' || typeof format === 'function') {
            this._formatter._default = typeof format === 'function' ? format : dot.template(format);
        } else if (Array.isArray(format)) {
            for (let format2 of format) {
                if (typeof format2 === 'string' || typeof format2 === 'function') {
                    this._formatter._default = typeof format2 === 'function' ? format2 : dot.template(format2);
                } else {
                    // Object of formats
                    for (const [method, template] of Object.entries(format2)) {
                        this._formatter[method] = typeof template === 'function' ? template : dot.template(template);
                    }
                }
            }
        } else {
            // Object of formats
            for (const [method, template] of Object.entries(format)) {
                this._formatter[method] = typeof template === 'function' ? template : dot.template(template);
            }
        }
    }
    get format() {
        return this._format || this.logger.format;
    }
    set level(level) {
        this._level = typeof level === 'string' ? this.logger.levels.indexOf(level) : level;
    }
    get level() {
        return this._level || this._logger.level;
    }
    set logger(logger) {
        Object.assign(this, {
            _logger: logger,
            _formatter: new Proxy({}, {
                get: (obj, prop) => {
                    return this.logger._formatter[prop];
                }
            })
        }, defaults, this.options);
    }
    get logger() {
        return this._logger;
    }
    get filters() {
        return this._filters || this.logger.filters;
    }
    set filters(filters) {
        this._filters = filters;
    }
    async write(data, ops) {
        if (data.level < this.level)
            return;

        this._queue.push([data, ops]);
        if (this._writing) {
            return;
        }
        this._writing = true;

        let args;
        while (args = this._queue.shift()) {
            try {
                const processed = this._process.apply(this, args);
                const ops = args[1];
                await this._write(processed, ops, args[0]);
                this._lastOps = ops;
            } catch (e) {
                console.log(e);
            }
        }

        this._writing = false;
    }
    _process(data, ops) {
        if (this.preprocessor)
            data = this.preprocessor(data);

        data.message = data.message.map(value => {
            if (typeof value === 'string')
                return value;
            return util.inspect(value);
        }).join(' ');

        const formatted = this._formatter[data.title](data);
        const filtered = this.filters[data.title] ?
            this.filters[data.title](formatted) :
            formatted;

        return filtered;
    }
}
