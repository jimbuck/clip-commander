const { clipboard } = require('electron');

const { randomString } = require('./utils');

class ClipboardWatcher {
    constructor({ delay = 250 } = {}) {
        this.delay = delay;
        this._subs = [];
        this._timer = null;

        this._currentValue = clipboard.readText();
    }

    start() {
        this.poll(true);
    }

    stop() {
        this._timer && clearTimeout(this._timer);
        this._timer = null;
    }

    poll(continuous) {
        let newClipboard = clipboard.readText();

        if (this._currentValue !== newClipboard) {
            this._currentValue = newClipboard;
            this._subs.forEach(cb => {
                try {
                    cb(this._currentValue);
                } catch (_) { }
            });
        }

        if (continuous) {
            this._timer = setTimeout(this.poll.bind(this, continuous), this.delay);
        }        
    }

    bind(cb) {
        this._subs.push(cb);

        return this;
    }

    unbind(cb) {
        let i = this._subs.indexOf(cb);
        if (i > -1) this._subs.splice(i, 1);
        return this;
    }
}

module.exports = { ClipboardWatcher };