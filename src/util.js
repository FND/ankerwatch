"use strict";

module.exports = {
	report: (level, ...msg) => {
		console.error(`[${level}]`, ...msg);
	}
};
