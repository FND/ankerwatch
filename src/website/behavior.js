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
	var ZOOM = 7;

	var sites = document.getElementById(SITES_ID).textContent;
	sites = JSON.parse(sites);
	var bounds = sites.map(function(site) {
		return [site.lat, site.lon];
	});

	var map = L.map(MAP_ID, { zoom: ZOOM });
	map.fitBounds(bounds, { padding: [50, 50] });
	L.tileLayer(TILES, { attribution: COPYRIGHT }).addTo(map);

	sites.forEach(function(site) {
		addSite(site, sites);
	});

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
				lat: site.lat,
				lon: site.lon
			}
		})
			.addTo(map)
			.bindPopup(desc)
			.on("click", onSelect);
	}

	function onSelect(ev) {
		var site = ev.sourceTarget.options.site;
		map.setView([site.lat, site.lon]);
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
