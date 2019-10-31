"use strict";

let https = require("https");

exports.retrieveJSON = uri => {
	let prom = exposedPromise();

	https.get(uri, res => {
		let data = [];
		res.on("data", chunk => {
			data.push(chunk);
		});
		res.on("end", () => {
			data = data.join("");
			try {
				prom.resolve(JSON.parse(data));
			} catch (err) {
				prom.reject(err);
			}
		});
	});

	return prom;
};

function exposedPromise() {
	let _resolve, _reject;
	let prom = new Promise((resolve, reject) => {
		_resolve = resolve;
		_reject = reject;
	});

	prom.resolve = _resolve;
	prom.reject = _reject;
	return prom;
}
