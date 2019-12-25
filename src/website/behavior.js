/* eslint-env browser */
/* global L */
(function() {
	var TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
	var COPYRIGHT =
		'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
	var ICONS = {
		anz: document.querySelector("#icon-anz").textContent,
		dep: document.querySelector("#icon-dep").textContent
	};
	var MAP_ID = "map";
	var SITES_ID = "sites";
	var TABS_SELECTOR = ".tabs > ul";
	var ZOOM = 7;

	var sites = document.getElementById(SITES_ID).textContent;
	sites = JSON.parse(sites);
	var bounds = sites.map(function(site) {
		return [site.lat, site.lon];
	});

	var tabs = document.querySelector(TABS_SELECTOR); // NB: assumes singleton
	tabs.addEventListener("click", onTab);

	var map = L.map(MAP_ID, { zoom: ZOOM });
	map.fitBounds(bounds, { padding: [50, 50] });
	L.tileLayer(TILES, { attribution: COPYRIGHT }).addTo(map);

	sites.forEach(function(site) {
		addSite(site, sites);
	});

	function onSite(ev) {
		var site = ev.sourceTarget.options.site;
		// XXX: tight coupling
		var slug = site.anz ? site.anz.slug : site.slug;
		var tab = tabs.querySelector('a[href="#' + slug + '"]');
		if (tab) {
			activateSite(tab);
		}
	}

	function onTab(ev) {
		var link = ev.target;
		if (link.nodeName !== "A" || !link.hash) {
			return;
		}
		// suppress auto-scrolling to frag ID while retaining URI state
		ev.preventDefault();
		activateSite(link);
	}

	function activateSite(link) {
		history.pushState(null, null, link.href);
		// force `:target` taking effect (hacky; cf. discussion at
		// https://bugs.webkit.org/show_bug.cgi?id=83490)
		history.back();
		setTimeout(function() {
			history.forward();
		}, 1);
	}

	function addSite(site, sites) {
		var desc = "<b>" + site.name + "</b>";
		var bezirk = site.bezirk;
		var anz = bezirk ? null : sites[site.ankerzentrum];
		desc += "<br>" + (bezirk || anz.bezirk);
		L.marker([site.lat, site.lon], {
			title: site.name,
			riseOnHover: true,
			icon: L.divIcon({
				html: siteIcon(site, anz)
			}),
			// XXX: hacky; custom extension seems brittle?
			site: {
				slug: site.slug,
				anz: anz,
				lat: site.lat,
				lon: site.lon
			}
		})
			.addTo(map)
			.bindPopup(desc)
			.on("click", onSite);
	}

	// NB: `anz` is a Dependance's associated Ankerzentrum, if any
	function siteIcon(site, anz) {
		return supplant('<div class="{cls}" style="{css}">{svg}</div>', {
			cls: anz ? "site-dep" : "site-anz",
			css: supplant("color: {color}; background-color: {bgcolor}", {
				color: site.schriftfarbe,
				bgcolor: anz ? anz.sekundaerfarbe : site.hauptfarbe
			}),
			svg: anz ? ICONS.dep : ICONS.anz
		});
	}

	// performs string substitution of named parameters enclosed in `{…}`
	// adapted from Douglas Crockford <http://javascript.crockford.com/remedial.html>
	function supplant(str, params) {
		return str.replace(/\{([^{}]*)\}/g, function(placeholder, key) {
			var res = params[key];
			return typeof res === "string" || typeof res === "number"
				? res
				: placeholder;
		});
	}
})();
