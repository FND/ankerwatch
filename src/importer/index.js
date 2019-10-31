#!/usr/bin/env node
"use strict";

let Store = require("./store");
let { retrieveTags } = require("./wordpress");

main();

async function main() {
	let tagIndex = await retrieveTags();
	let store = new Store(tagIndex);
	await store._pending;
}
