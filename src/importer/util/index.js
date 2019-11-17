"use strict";

let RelationalIndex = require("./rel_index");
let { retrieveJSON } = require("./http");

class Index extends Map {
	constructor(key, allowUpdates) {
		super();
		this._key = key;
		this._immutable = !allowUpdates;
	}

	add(value, overwrite) {
		let key = value[this._key];
		if (this._immutable && this.has(key)) {
			throw new Error(`attempting to overwrite entry for \`${key}\``);
		}
		this.set(key, value);
	}

	get(key) {
		if (!this.has(key)) {
			throw new Error(`missing entry for \`${key}\``);
		}
		return super.get(key);
	}

	forEach(callback) {
		Array.from(this.entries()).forEach(callback);
	}
}

module.exports = {
	Index,
	RelationalIndex,
	retrieveJSON
};
