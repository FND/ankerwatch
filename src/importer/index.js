"use strict";

let Store = require("./store");
let { retrieveTags } = require("./wordpress");

module.exports = async () => {
	let tagIndex = await retrieveTags();
	let store = new Store(tagIndex);
	await store._pending;
	return store;
};
