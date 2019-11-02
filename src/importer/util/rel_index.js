"use strict";

module.exports = class RelationalIndex extends Map {
	constructor(keyKey, valueKey) {
		super();
		this._key = keyKey;
		this._value = valueKey;
	}

	add(source, target) {
		let key = source[this._key];
		if (this.has(key)) {
			var items = this.get(key); // eslint-disable-line no-var
		} else {
			items = new Set();
			this.set(key, items);
		}

		let value = target[this._value];
		items.add(value);
	}

	get(key) {
		// XXX: fallback might be confusing if consumer expects mutability
		return super.get(key) || new Set();
	}

	forEach(callback) {
		Array.from(this.entries()).forEach(callback);
	}
};
