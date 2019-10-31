"use strict";

let { Tag } = require("./models");
let { Index, retrieveJSON } = require("./util");
let { HOST } = require("./config");

let BATCH_SIZE = 100;
let TAGS_URI = `${HOST}/tags?per_page=${BATCH_SIZE}`;

exports.retrieveTags = retrieveTags;

// returns `Tag`s by ID
async function retrieveTags(memo, page = 0) {
	let uri = `${TAGS_URI}&page=${page + 1}`;
	console.error(`[DEBUG] retrieving <${uri}>`);
	let tags = await retrieveJSON(uri);
	let paginate = tags.length === BATCH_SIZE;
	if (memo) {
		tags = memo.concat(tags);
	}
	if (paginate) {
		return retrieveTags(tags, page + 1);
	}

	return tags.reduce((index, payload) => {
		let tag = new Tag(payload);
		index.add(tag);
		return index;
	}, new Index("id"));
}
