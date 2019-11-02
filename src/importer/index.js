#!/usr/bin/env node
"use strict";

let Store = require("./store");
let { retrieveTags } = require("./wordpress");

main();

async function main() {
	let tagIndex = await retrieveTags();
	let store = new Store(tagIndex);
	await store._pending;

	let { log } = console;
	store.sites.forEach(site => {
		log(`🏢 ${site.name}`);
		let topics = store.topicsBySite(site);
		topics.forEach(topic => {
			let posts = store.postsBySiteAndTopic(site, topic);
			log(`  🏷 ${topic.name} (${posts.length})`);
			posts.forEach(post => {
				log(`  * ${post.title}\n    <${post.uri}>`);
			});
		});
	});
}
