"use strict";

let renderPage = require("./template");
let importAll = require("../importer");
let { retrieveSites } = require("../../config");
let { readFile } = require("fs").promises;
let path = require("path");

let STYLES = path.resolve(__dirname, "styles.css");
STYLES = readFile(STYLES, "utf8");
let SCRIPTS = path.resolve(__dirname, "behavior.js");
SCRIPTS = readFile(SCRIPTS, "utf8");

main();

async function main() {
	let styles = await STYLES;
	let scripts = await SCRIPTS;

	let groupedSites = await retrieveSites();
	let siteData = groupedSites.flat().map(site => {
		let { slug, name, bezirk, latitude: lat, longitude: lon } = site;
		site = { slug, name, lat, lon };
		return bezirk ? { ...site, bezirk } : site;
	});
	let store = await importAll();

	let html = renderPage(
		{
			title: "Vorfallsberichte",
			content: renderTabs(groupedSites, store),
			siteData: JSON.stringify(siteData)
		},
		styles,
		scripts
	);
	console.log(html); // eslint-disable-line no-console
}

function renderTabs(groupedSites, store) {
	return `
<div class="tabs">
	<ul>
	${groupedSites
		.map(group => {
			let { slug, name } = group[0]; // Ankerzentrum
			return `<li><a href="#${slug}">${name}</a></li>`;
		})
		.join("\n")}
	</ul>
	${groupedSites
		.map(group => {
			let { slug } = group[0]; // Ankerzentrum
			return `<article id="${slug}" class="site">
			${group.map(site => renderSite(site, store)).join("\n")}
		</article>`;
		})
		.join("\n")}
</div>`;
}

function renderSite({ slug, name, bezirk }, store) {
	try {
		var site = store.siteByID(slug); // eslint-disable-line no-var
	} catch (err) {
		return; // no data
	}

	let topics = store.topicsBySite(slug);
	let postCount = store.postsBySite(slug).length;
	let heading = bezirk ? "h2" : "h3";
	if (bezirk) {
		name += `, ${bezirk}`;
	}

	return `
<${heading}>
	<a href="${site.link}">${name}</a>
	<small>(${postCount})</small>
</${heading}>

	${renderPostsByTopic(topics, slug, store)}`;
}

function renderPostsByTopic(topics, site, store) {
	if (topics.length === 0) {
		return "";
	}
	return `
<ul class="topics">
	${topics
		.map(topic => {
			let posts = store.postsBySiteAndTopic(site, topic);
			return `
	<li>
		<b>${topic.name} <small>(${posts.length})</small></b>
		<ul>
			${posts
				.map(({ uri, title }) => {
					return `<li><a href="${uri}">${title}</a></li>`;
				})
				.join("\n")}
		</ul>
	</li>`;
		})
		.join("\n")}
</ul>`;
}
