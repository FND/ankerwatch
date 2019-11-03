let parseCSV = require("csv-parse");
let { readFile } = require("fs").promises;
let path = require("path");
let { promisify } = require("util");

parseCSV = promisify(parseCSV);

let FILEPATH = path.resolve(__dirname, "ankerzentren.csv");
let DELIMITER = ",";

// returns sites grouped by Ankerzentrum
exports.retrieveSites = async () => {
	let csv = await readFile(FILEPATH, "utf8");
	csv = csv
		.split(/\r?\n|\r/) // account for various line breaks
		.filter(line => line !== "") // discard blank lines
		.join("\n");

	let records = await parseCSV(csv, { delimiter: DELIMITER });
	// group by Ankerzentrum
	let headers = records.shift();
	let lastHeader = headers[headers.length - 1];
	return records.reduce((memo, record) => {
		// turn to object
		record = headers.reduce((memo, field, i) => {
			memo[field] = record[i] || null;
			return memo;
		}, {});

		let newGroup = record[lastHeader] !== null;
		if (newGroup) {
			return memo.concat([[record]]); // nested array
		}
		let group = memo[memo.length - 1];
		group.push(record);
		return memo;
	}, []);
};
