#!/usr/bin/env node
"use strict";

let renderPage = require("./template");
let importAll = require("../importer");
let { retrieveSites } = require("../../config");
let { copyFile, writeFile } = require("fs").promises;
let path = require("path");

let FILENAMES = {
	html: "index.html",
	css: "styles.css",
	js: "behavior.js"
};
let STYLES = path.resolve(__dirname, FILENAMES.css);
let SCRIPTS = path.resolve(__dirname, FILENAMES.js);

module.exports = async targetDir => {
	let groupedSites = await retrieveSites();
	let ankerzentrum;
	let siteData = groupedSites.flat().map((site, i) => {
		let data = {
			slug: site.slug,
			name: site.name,
			lat: site.latitude,
			lon: site.longitude,
			schriftfarbe: site.schriftfarbe
		};

		let { bezirk } = site;
		if (!bezirk) {
			return { ...data, ankerzentrum };
		}

		ankerzentrum = i;
		let { hauptfarbe, sekundaerfarbe } = site;
		return { ...data, bezirk, hauptfarbe, sekundaerfarbe };
	});
	let store = await importAll();

	let html = renderPage(
		{
			title: "Vorfallsberichte",
			content: renderTabs(groupedSites, store),
			siteData: JSON.stringify(siteData)
		},
		FILENAMES.css,
		FILENAMES.js
	);
	return Promise.all([
		writeFile(path.resolve(targetDir, FILENAMES.html), html),
		copyFile(STYLES, path.resolve(targetDir, FILENAMES.css)),
		copyFile(SCRIPTS, path.resolve(targetDir, FILENAMES.js))
	]);
};

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
