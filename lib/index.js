const path = require('path');
const moment = require('moment');
const dot = require('dot');

const defaults = {
    levels: ['trace', 'debug', 'log', 'info', 'warn', 'error', 'fatal'],
    level: "trace",
    filters: {},
    format: "{{=it.timestamp}} <{{=it.title}}> {{=it.file}}:{{=it.line}} ({{=it.method}}) {{=it.message}}"
};

// Stack trace format :
// https://github.com/v8/v8/wiki/Stack%20Trace%20API
var stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/i;
var stackReg2 = /at\s+()(.*):(\d*):(\d*)/i;

class Logger {
    constructor(options) {
        Object.assign(this, defaults, options);
        this.levels.forEach((level, idx) => {
            this[level] = this.write.bind(this, idx, level);
        });
    }
    set transports(transports) {
        for (let transport of transports) {
            transport.logger = this;
        }
        this._transports = transports;
    }
    get transports() {
        return this._transports;
    }
    set format(format) {
        this._format = format;
        this._formatter = new Proxy({
            _default: dot.template("{{=it.timestamp}} <{{=it.title}}> {{=it.file}}:{{=it.line}} ({{=it.method}}) {{=it.message}}")
        }, {
            get: (obj, prop) => {
                if (prop in obj) {
                    return obj[prop];
                }
                return obj._default;
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
        return this._format;
    }
    set level(level) {
        this._level = typeof level === 'string' ? this.levels.indexOf(level) : level;
    }
    get level() {
        return this._level;
    }
    write() {
        const timestamp = moment().format(this.dateformat);
        const args = Array.prototype.slice.call(arguments);
        let ops = {};
        if (typeof args[2] === 'object' && args[2].__tracer_ops) {
            ops = args.splice(2, 1)[0];
            delete ops.__tracer_ops;
        }
        const data = {
            level: args.shift(),
            title: args.shift(),
            timestamp,
            message: args
        };

        const stacklist = (new Error()).stack.split('\n').slice(2);
        const s = stacklist[0],
            sp = stackReg.exec(s) || stackReg2.exec(s);
        if (sp && sp.length === 5) {
            data.method = sp[1];
            data.path = sp[2];
            data.line = sp[3];
            data.pos = sp[4];
            data.file = path.basename(data.path);
            data.stack = stacklist.join('\n');
        }

        for (const transport of this._transports) {
            transport.write(Object.assign({}, data), Object.assign({}, ops));
        }
    }
};

module.exports = {
    Logger,
    transports: require('./transports')
};
