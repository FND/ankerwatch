"use strict";

let { Topic, Ankerzentrum, Dependance } = require("./models");
let { Index, RelationalIndex } = require("./util");
let { report } = require("../util");
let { SITE_TYPES } = require("./config");

// XXX: awkwardly redundant WRT config
let MODELS = {
	ANZ: Ankerzentrum,
	DEP: Dependance,
	TPC: Topic
};

module.exports = class Store {
	constructor(tagIndex) {
		this._tags = tagIndex;
		this._posts = new Index("uri", true);
		this._sites = new Index("slug");
		this._topics = new Index("slug");
		this._postsBySite = new RelationalIndex("slug", "uri");
		this._topicsBySite = new RelationalIndex("slug", "slug");
		this._sitesByTopic = new RelationalIndex("slug", "slug");
		this._pending = this._ingest();
	}

	postsBySiteAndTopic(site, topic) {
		// allow for both entities and IDs, for convenience
		let siteID = site.slug || site;
		let topicID = topic.slug || topic;

		let posts = this._postsBySite.get(siteID);
		return Array.from(posts).reduce((memo, postID) => {
			let post = this._posts.get(postID);
			let match = post.tags.some(tag => tag.slug === topicID);
			return match ? memo.concat(post) : memo;
		}, []);
	}

	postsBySite(site) {
		let id = site.slug || site; // for convenience
		return resolve(id, this._postsBySite, this._posts);
	}

	topicsBySite(site) {
		let id = site.slug || site; // for convenience
		return resolve(id, this._topicsBySite, this._topics);
	}

	sitesByTopic(topic) {
		let id = topic.slug || topic; // for convenience
		return resolve(id, this._sitesByTopic, this._sites);
	}

	siteByID(id) {
		return this._sites.get(id);
	}

	get sites() {
		return Array.from(this._sites.values());
	}

	get topics() {
		return Array.from(this._topics.values());
	}

	async _ingest() {
		// separate sites from topics (based on prefix configuration)
		let tags = Array.from(this._tags.values());
		tags.forEach(tag => {
			let { slug } = tag;
			let Model = determineModel(slug);
			let entity = new Model(tag);
			let index = Model === MODELS.TPC ? this._topics : this._sites;
			index.add(entity);
		});

		// retrieve and index sites' posts while indexing topics by site
		let sites = Array.from(this._sites.values());
		report(
			"INFO",
			`${tags.length} tags: ${sites.length} sites, ${
				Array.from(this._topics.keys()).length
			} topics`
		);
		let requests = sites.map(async site => {
			let posts = await site.retrievePosts(this._tags);
			posts.forEach(post => {
				this._ingestPost(post);
			});
		});
		await Promise.all(requests);

		// index sites by topic
		this._topicsBySite.forEach(([siteID, topicIDs]) => {
			let posts = this._postsBySite.get(siteID).size;
			report("INFO", siteID, `(${topicIDs.size} topics, ${posts} posts)`);

			topicIDs.forEach(topicID => {
				this._sitesByTopic.add({ slug: topicID }, { slug: siteID }); // XXX: hacky
			});
		});
		this._sitesByTopic.forEach(([topicID, siteIDs]) => {
			report("INFO", topicID, `(at ${siteIDs.size} sites)`);
		});
	}

	async _ingestPost(post) {
		this._posts.add(post);

		// separate sites from topics
		let sites = [];
		let topics = [];
		post.tags.forEach(tag => {
			let collection = this._sites.has(tag.slug) ? sites : topics;
			collection.push(tag);
		});

		if (sites.length !== 1) {
			report(
				"WARN",
				`<${post.uri}> has ${sites.length} sites:`,
				sites.map(tag => tag.slug).join(", ")
			);
		}
		let site = sites[0];
		this._postsBySite.add(site, post);

		topics.forEach(topic => {
			this._topicsBySite.add(site, topic);
		});
	}
};

function determineModel(slug) {
	let i = slug.indexOf("-");
	if (i !== -1) {
		let prefix = slug.substr(0, i + 1);
		var type = SITE_TYPES[prefix]; // eslint-disable-line no-var
	}
	return type ? MODELS[type] : MODELS.TPC;
}

function resolve(id, relIndex, index) {
	let items = relIndex.get(id);
	return Array.from(items).map(id => index.get(id));
}
