"use strict";

// NB: WordPress-specific
module.exports = class Post {
	// eslint-disable-next-line camelcase
	constructor({ title, tags, modified_gmt, link }, tagIndex) {
		this.title = title.rendered;
		this.tags = tags.map(tag => tagIndex.get(tag));
		this.timestamp = new Date(Date.parse(modified_gmt)); // TODO: use `date_gmt`?
		this.uri = link;
	}

	toString() {
		let { name } = this.constructor;
		return `<${name} ${this.uri} "${this.title}">`;
	}
};
