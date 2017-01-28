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
		zipFileName: "offline",   // zip folder and filename
		src: "dist",  			  // production code source folder
		isSameOrigin: false,	  // whether to add webserver url to all resources
		map: []			  		  // folder and url mapping
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

AkPlugin.prototype.getZipFileName = function(answers) {
    this.config.zipFileName = answers.zipFileName;
    this.config.src = answers.src;
    this.config.isSameOrigin = answers.isSameOrigin;
    this.inputConfig();
};

/**
 * [add zip file name]
 */
AkPlugin.prototype.addZipFileName = function() {
	return inquirer.prompt([
		{
			type: "input",
			name: "zipFileName",
			default: "offline",
			message: "Your zip file name(e.g., offline):",
		}, 
		{
			type: "input",
			name: "src",
			default: "dist",
			message: "Your source folder(e.g., build, pub, dist):",
		}, 
		{
			type: "confirm",
			name: "isSameOrigin",
			default: false,
			message: "Whether to add webserver url for all resources",
		}, 
	]).then((ansers) => {
		this.getZipFileName(ansers)
	});
};

AkPlugin.prototype.getConfig = function(answers) {
	if (answers.src && answers.url) {
    	this.config.map.push(answers);
    	this.inputConfig();
    }
    else {
    	// not stop until empty input
    	console.log("\n");
    	this.createConfig();
    }
}

/**
 * [add mapping config]
 */
AkPlugin.prototype.inputConfig = function() {
	
	return inquirer.prompt([
		{
			type: "input",
			name: "src",
			message: "Your resource folder(e.g., cdn, cdn/js, cdn/css, webserver):",
		}, 
		{
			type: "input",
			name: "url",
			message: "Your destination url(e.g.,//huayang.qq.com/h5/):",
		}
	]).then((answers) => {
	    this.getConfig(answers);
	});
};

/**
 * [create config]
 */
AkPlugin.prototype.createConfig = function() {
	let isJs = true,
		isForce = true;

	utils.createConfig("", this.config, isJs, isForce);
};

/**
 * [read config]
 */
AkPlugin.prototype.readConfig = function() {
	let isJs = true;
	this.config = utils.readConfig("", isJs);
};

/**
 * [copy files to offline folder]
 */
AkPlugin.prototype.copyFiles = function() {
	
	fs.removeSync(path.resolve(this.config.zipFileName));
	fs.removeSync(path.resolve(this.config.zipFileName + ".zip"));

	this.config.map.forEach((item, key) => {
		let srcPath = path.join(this.config.src, item.src);

		let url = item.url.replace("http://", "").replace("https://", "").replace("//", "").replace(":", "/");

		let destPath = path.join(this.config.zipFileName, url);

		fs.copySync(srcPath, destPath);

		console.log(destPath + " is copied success!");
	});
};

/**
 * [replace cdn url with webserver url]
 */
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
			let srcPath = path.join(config.zipFileName, folder),
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

/**
 * [start zip file]
 */
AkPlugin.prototype.startZipFile = function() {
	this.readConfig();
	this.copyFiles();

	if (this.config.isSameOrigin) {
		this.replaceUrl();
	}

	this.zipFiles();
};

/**
 * [zip files]
 */
AkPlugin.prototype.zipFiles = function() {
	let zipPath = path.resolve(this.config.zipFileName + ".zip");

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

	archive.directory(this.config.zipFileName);

	// pipe archive data to the file
	archive.pipe(output);

};


module.exports = AkPlugin;