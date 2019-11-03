"use strict";

let importAll = require("../importer");
let { retrieveSites } = require("../../config");

let { log } = console;

let TEMPLATE = `<!DOCTYPE html>
<html lang="de">

<head>
	<meta charset="utf-8">
	<title>Vorfallsberichte | anker-watch.de</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<style>
body {
	font-family: sans-serif;
}
	</style>
</head>

<body>
	<h1>Vorfallsberichte</h1>
	%BODY%
</body>

</html>`;

main();

async function main() {
	let groupedSites = await retrieveSites();

	let store = await importAll();
	let [before, after] = TEMPLATE.split("%BODY%");

	log(before);
	groupedSites.forEach(group => {
		log("<article>");
		group.forEach(site => {
			renderSite(site, store);
		});
		log("</article>");
	});
	log(after);
}

function renderSite({ slug, name, bezirk }, store) {
	let postCount = store.postsBySite(slug).length;
	let heading = bezirk ? "h2" : "h3";
	if (bezirk) {
		name += `, ${bezirk}`;
	}
	log(`<${heading}>${name} <small>(${postCount})</small></${heading}>`);

	let topics = store.topicsBySite(slug);
	if (!topics.length) {
		return;
	}

	log("<ul>");
	topics.forEach(topic => {
		let posts = store.postsBySiteAndTopic(slug, topic);
		log(`<li>🏷 ${topic.name} <small>(${posts.length})</small>`);
		log("<ul>");
		posts.forEach(post => {
			log(`<li><a href="${post.uri}">${post.title}</a></li>`);
		});
		log("</ul>");
		log("</li>");
	});
	log("</ul>");
}
