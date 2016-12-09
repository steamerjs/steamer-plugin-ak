"use strict";

function AkPlugin(argv) {
	this.argv = argv;
}

AkPlugin.prototype.init = function() {
	console.log(this.argv);
};

module.exports = AkPlugin;