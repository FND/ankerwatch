"use strict";

let importAll = require("../importer");
let { retrieveSites } = require("../../config");
let { readFile } = require("fs").promises;
let path = require("path");

let { log } = console;

let TEMPLATE = path.resolve(__dirname, "template.html");
TEMPLATE = readFile(TEMPLATE, "utf8");
let STYLES = path.resolve(__dirname, "styles.css");
STYLES = readFile(STYLES, "utf8");

main();

async function main() {
	let groupedSites = await retrieveSites();

	let store = await importAll();
	let template = await TEMPLATE;
	let styles = await STYLES;
	template = template.replace("%STYLES%", styles);
	let [before, after] = template.split("%BODY%");

	log(before);
	log('<div class="tabs">');

	log("<ul>");
	groupedSites.forEach(group => {
		let ankerzentrum = group[0];
		log(`<li>
		<a href="#${ankerzentrum.slug}">${ankerzentrum.name}</a>
		</li>`);
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
	let site = store.siteByID(slug);
	let postCount = store.postsBySite(slug).length;
	let heading = bezirk ? "h2" : "h3";
	if (bezirk) {
		name += `, ${bezirk}`;
	}
	log(`<${heading}>
	<a href="${site.link}">${name}</a> <small>(${postCount})</small>
	</${heading}>`);

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
