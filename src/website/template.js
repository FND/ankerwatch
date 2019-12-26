"use strict";

let { readFileSync } = require("fs");
let path = require("path");

// icons adapted from https://iconsvg.xyz
let ICONS = {
	anz: readFileSync(path.resolve(__dirname, "icons", "anz.svg"), "utf8"),
	dep: readFileSync(path.resolve(__dirname, "icons", "dep.svg"), "utf8")
};

module.exports = (
	{ title, content, siteData },
	styles,
	scripts
) => `<!DOCTYPE html>
<html lang="de">

<head>
	<meta charset="utf-8">
	<title>${title} | anker-watch.de</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.5.1/dist/leaflet.css"
			integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
			crossorigin="anonymous">
	<link rel="stylesheet" href="${styles}">
</head>

<body>
	<main>
		<header class="fullwidth">
			<h1>
				<a href="">${title}</a>
			</h1>
			<a href="https://www.anker-watch.de">anker-watch.de</a>
		</header>
		<div id="map" class="map fullwidth"></div>

${content}

		<footer class="fullwidth">
			<a href="https://www.anker-watch.de/wir-ueber-uns/kontakt/">Impressum &amp; Datenschutz</a>
		</footer>
	</main>

	 <script src="https://unpkg.com/leaflet@1.5.1/dist/leaflet.js"
			integrity="sha512-GffPMF3RvMeYyc1LWMHtK8EbPv0iNZ8/oTtHPx9/cc2ILxQ+u905qIwdpULaqDkyBKgOaB57QTMg7ztg8Jm2Og=="
			crossorigin="anonymous"></script>

	<script id="icon-anz" type="text/svg">
${ICONS.anz}
	</script>
	<script id="icon-dep" type="text/svg">
${ICONS.dep}
	</script>
	<script id="sites" type="text/json">
${siteData}
	</script>
	<script src="${scripts}"></script>
</body>

</html>
`;
