"use strict";

let Tag = require("./tag");

module.exports = {
	Tag,
	Topic: class Topic extends Tag {},
	Ankerzentrum: class Ankerzentrum extends Tag {},
	Dependance: class Dependance extends Tag {}
};
