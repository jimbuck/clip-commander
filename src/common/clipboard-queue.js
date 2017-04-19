class ClipboardQueue {
    constructor({ limit = 10, history = [] } = {}) {
        this.history = history;
        this.limit = limit;
    }

    push(val) {
        if (this.history[0] === val) return;

        let i = this.history.indexOf(val);
        if (i > -1) this.history.splice(i, 1);

        this.history.unshift(val);
        if (this.history.length > this.limit) {
            this.history.pop();
        }
    }

    peek() {
        return this.history[0];
    }

    pop() {
        return this.history.shift();
    }

    remove(val) {
        let i = this.history.indexOf(val);
        this.history.splice(i, 1);
    }

    forEach(callback) {
        return this.history.forEach(callback);
    }

    map(callback) {
        return this.history.map(callback);
    }

    toJSON() {
        return {
            limit: this.limit,
            history: this.history.slice()
        };
    }
}

module.exports = { ClipboardQueue };