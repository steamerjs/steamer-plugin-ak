"use strict";

const inquirer = require('inquirer'),
	  path = require('path'),
	  fs = require('fs-extra'),
	  archiver = require('archiver'),
	  pluginUtils = require('steamer-pluginutils');

var utils = new pluginUtils();
utils.pluginName = "steamer-plugin-ak";

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'gi'), replacement);
};

function AkPlugin(argv) {
	this.argv = argv;
	this.config = {
		zip: "offline",
		source: "build",
		map: []
	};
}

AkPlugin.prototype.init = function() {
	let argv = this.argv;

	if (argv.init || argv.i) {
		this.addZipFileName();
	}
	else if (argv.compress || argv.c) {
		this.startZipFile();
	}
};

AkPlugin.prototype.addZipFileName = function() {
	inquirer.prompt([
		{
			type: "input",
			name: "zip",
			default: "offline",
			message: "Your zip file name(e.g., offline):",
		}, 
		{
			type: "input",
			name: "source",
			default: "build",
			message: "Your source folder(e.g., build, pub, dist):",
		}, 
	]).then((answers) => {
	    this.config.zip = answers.zip;
	    this.config.source = answers.source;
	    this.inputConfig();
	});
};

AkPlugin.prototype.inputConfig = function() {
	inquirer.prompt([
		{
			type: "input",
			name: "src",
			message: "Your resource folder(e.g., cdn, cdn/js, cdn/css, webserver):",
		}, 
		{
			type: "input",
			name: "url",
			message: "Your destination url(e.g.,huayang.qq.com/h5/):",
		}
	]).then((answers) => {
	    if (answers.src && answers.url) {
	    	this.config.map.push(answers);
	    	this.inputConfig();
	    }
	    else {
	    	console.log("Your config is:\n");
	    	this.createConfig();
	    }
	});
};

AkPlugin.prototype.startZipFile = function() {
	this.readConfig();
	this.copyFiles();

	if (this.argv.sameorigin || this.argv.s) {
		this.replaceUrl();
	}

	this.zipFiles();
};

AkPlugin.prototype.createConfig = function() {
	let isJs = true,
		isForce = true;

	utils.createConfig("", this.config, isJs, isForce);
};

AkPlugin.prototype.readConfig = function() {
	let isJs = true;
	this.config = utils.readConfig("", isJs);
};

AkPlugin.prototype.copyFiles = function() {
	
	fs.removeSync(path.resolve(this.config.zip));
	fs.removeSync(path.resolve(this.config.zip + ".zip"));

	this.config.map.forEach((item, key) => {
		let srcPath = path.join(this.config.source, item.src);

		let url = item.url.replace("http://", "").replace("https://", "").replace("//", "");

		let destPath = path.join(this.config.zip, url);

		fs.copySync(srcPath, destPath);

		console.log(destPath + " is copied success!");
	});
};

AkPlugin.prototype.replaceUrl = function() {
	let hasWebserver = false,
		hasCdn = false,
		webserverUrl = null,
		cdnUrl = null;

	this.config.map.forEach((item, key) => {
		if (item.src === "webserver") {
			hasWebserver = true;
			webserverUrl = item.url;
		}

		if (item.src === "cdn") {
			hasCdn = true;
			cdnUrl = item.url;
		}
	});

	if (hasWebserver && hasCdn) {

		function walkAndReplace(config, folder, extname) {
			let srcPath = path.join(config.zip, folder),
				files = fs.walkSync(srcPath);

			files = files.filter((item, key) => {
				return path.extname(item) === "." + extname;
			});

			files.map((item, key) => {
				let content = fs.readFileSync(item, "utf-8");
				content = content.replaceAll(cdnUrl, webserverUrl);
				fs.writeFileSync(item, content, "utf-8");
			});
		}

		walkAndReplace(this.config, cdnUrl.replaceAll("//", ""), "js");
		walkAndReplace(this.config, webserverUrl.replaceAll("//", ""), "html");
	}
};

AkPlugin.prototype.zipFiles = function() {
	let zipPath = path.resolve(this.config.zip + ".zip");

	var output = fs.createWriteStream(zipPath);
	var archive = archiver('zip', {
	    store: true // Sets the compression method to STORE.
	});

	output.on('close', function() {
	  console.log(archive.pointer() + ' total bytes');
	  console.log('archiver has been finalized and the output file descriptor has closed.');
	});

	// good practice to catch this error explicitly
	archive.on('error', function(err) {
	  throw err;
	});

	archive.directory(this.config.zip);

	// pipe archive data to the file
	archive.pipe(output);

};


module.exports = AkPlugin;