/* global L */
(function() {
	var TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
	var COPYRIGHT =
		'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
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
		addSite(site);
	});

	function addSite(site) {
		var desc = "<b>" + site.name + "</b>";
		if (site.bezirk) {
			desc += "<br>" + site.bezirk;
		}
		L.marker([site.lat, site.lon], {
			title: site.name,
			riseOnHover: true,
			// TODO: icon, color
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
})();
