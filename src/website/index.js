"use strict";

let importAll = require("../importer");

let TEMPLATE = `<!DOCTYPE html>
<html lang="de">

<head>
	<meta charset="utf-8">
	<title>Übersicht | anker-watch</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<style>
body {
	font-family: sans-serif;
}
	</style>
</head>

<body>
	<h1>Übersicht</h1>
	%BODY%
</body>

</html>`;

main();

async function main() {
	let store = await importAll();
	let [before, after] = TEMPLATE.split("%BODY%");

	let { log } = console;
	log(before);
	store.sites.forEach(site => {
		let postCount = store.postsBySite(site).length;
		log(`<h2>🏢 ${site.name} <small>(${postCount})</small></h2>`);

		let topics = store.topicsBySite(site);
		if (!topics.length) {
			return;
		}

		log("<ul>");
		topics.forEach(topic => {
			let posts = store.postsBySiteAndTopic(site, topic);
			log(`<li>🏷 ${topic.name} <small>(${posts.length})</small>`);
			log("<ul>");
			posts.forEach(post => {
				log(`<li><a href="${post.uri}">${post.title}</a></li>`);
			});
			log("</ul>");
			log("</li>");
		});
		log("</ul>");
	});
	log(after);
}
