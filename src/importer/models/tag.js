"use strict";

let Post = require("./post");
let { retrieveJSON } = require("../util");

// NB: WordPress-specific
module.exports = class Tag {
	constructor(data) {
		["id", "slug", "name", "link"].forEach(field => {
			this[field] = data[field];
		});
		// allow subclasses to to be constructed from `Tag` instances as well as
		// from original JSON data
		let { _links } = data;
		this.postsURI = _links ? _links["wp:post_type"][0].href : data.postsURI;
	}

	async retrievePosts(tagIndex) {
		let posts = await retrieveJSON(this.postsURI);
		this.posts = posts = posts.map(payload => new Post(payload, tagIndex));
		return posts;
	}

	toString() {
		let { name } = this.constructor;
		return `<${name} #${this.id} \`${this.slug}\` "${this.name}">`;
	}
};
