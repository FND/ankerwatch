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
	max-width: 40rem;
	margin: 1em auto;
}

.tabs > ul {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-evenly;
	margin: 1em 0;
	list-style-type: none;
}

.tabs article:not(:target) {
	display: none;
}

.site h2::before {
	content: "⚓ ";
}

.topics {
	padding: 0;
	list-style-type: none;
}

.topics > li::before {
	content: "🏷 ";
}

.topics > li + li {
	margin-bottom: 0.5em;
}

.topics > li > b {
	display: inline-block;
	margin-bottom: 0.5em;
	font-weight: normal;
}

.topics ul {
	margin-bottom: 1em;
	padding-left: 1em;
	list-style-type: disc;
	line-height: 1.5;
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
	log('<div class="tabs">');

	log("<ul>");
	groupedSites.forEach(group => {
		let ankerzentrum = group[0];
		log("<li>");
		log(`<a href="#${ankerzentrum.slug}">${ankerzentrum.name}</a>`);
		log("</li>");
	});
	log("</ul>");

	groupedSites.forEach(group => {
		let ankerzentrum = group[0];
		log(`<article id="${ankerzentrum.slug}" class="site">`);
		group.forEach(site => {
			renderSite(site, store);
		});
		log("</article>");
	});

	log("</div>");
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

	log('<ul class="topics">');
	topics.forEach(topic => {
		let posts = store.postsBySiteAndTopic(slug, topic);
		log("<li>");
		log(`<b>${topic.name} <small>(${posts.length})</small></b>`);
		log("<ul>");
		posts.forEach(post => {
			log(`<li><a href="${post.uri}">${post.title}</a></li>`);
		});
		log("</ul>");
		log("</li>");
	});
	log("</ul>");
}
