const dot = require('dot');
const moment = require('moment');
const util = require('util');

const defaults = {
    _lastOps: {},
    _queue: [],
    _flushListeners: []
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
    get levels() {
        return this._logger.levels;
    }
    set level(l) {
        this._level = typeof l === 'string' ? this.logger.levels.indexOf(l) : l;
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
    set filters(f) {
        this._filters = f;
    }
    set preprocessor(p) {
        this._preprocessor = p;
    }
    get preprocessor() {
        return this._preprocessor || this.logger.preprocessor;
    }
    set postprocessor(p) {
        this._preprocessor = p;
    }
    get postprocessor() {
        return this._postprocessor || this.logger.postprocessor;
    }
    set dateformat(d) {
        this._dateformat = d;
    }
    get dateformat() {
        return this._dateformat || this.logger.dateformat;
    }
    async flush() {
        if (!~util.inspect(this._writing).indexOf('pending'))
            return;
        let _self = this;
        await new Promise(res => {
            _self._flushListeners.push(res);
        });
    }
    async write(data, ops) {
        if (data.level < this.level)
            return;

        await (this._writing = (async () => {
            await this._writing;
            try {
                const [processedData, processedOps] = await this._process(data, ops);
                await this._write(processedData, processedOps, data);
                this._last = {
                    ops: processedOps
                };
            } catch (e) {
                console.log(e);
            }
        })());

        if (!~util.inspect(this._writing).indexOf('pending'))
            while (this._flushListeners.length)
                this._flushListeners.pop()();
    }
    async _process(data, ops) {
        if (this.preprocessor)
            [data, ops] = await this.preprocessor(data, ops);

        data.message = data.message.map(value => {
            if (typeof value === 'string')
                return value;
            return util.inspect(value);
        }).join(' ');

        if (data.context)
            data.context = util.inspect(data.context);

        data.timestamp = moment(data.timestmap).format(this.dateformat);

        const levelName = this.levels[data.level];
        const formatted = await this._formatter[levelName](data);
        let filtered = this.filters[levelName] ?
            await this.filters[levelName](formatted) :
            formatted;

        if (this.postprocessor)
            filtered = await this.postprocessor(filtered);

        return [filtered, ops];
    }
}
