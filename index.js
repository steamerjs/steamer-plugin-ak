"use strict";

const inquirer = require('inquirer'),
	path = require('path'),
	fs = require('fs-extra'),
	klawSync = require('klaw-sync'),
	archiver = require('archiver'),
	minimatch = require('minimatch'),
	pluginUtils = require('steamer-pluginutils');

String.prototype.replaceAll = function(search, replacement) {
	var target = this;
	return target.replace(new RegExp(search, 'gi'), replacement);
};

String.prototype.replaceJsAll = function(search, replacement, extension) {
	var target = this,
		originSearch = search,
		originWebserver = replacement,
    	cdnUrl = search.replace("//", ""),
    	webserverUrl = replacement.replace("//", "");

	search = search.replace("//", "");
	if (search[search.length - 1] === "/") {
    	search = search.substr(0, search.length - 1);
	}

	if (extension === 'html') {
	    target = target.replace(new RegExp("(<script[^>]*src=([\'\"]*)(.*?)([\'\"]*).*?\>(<\/script>)?)", 'gi'), function(match) {
	    	if (!!~match.indexOf(cdnUrl)) {
	    		match = match.replace(cdnUrl, webserverUrl);
	    	}
	    	return match;
	    });
	}
	else if (extension === 'js') {
	    target = target.replace(new RegExp(search + "(\\\/(\\w){0,})+(.js)", 'gi'), function(match) {
	    	match = match.replace(cdnUrl, webserverUrl);
	    	return match;
	    });

	    target = target.replace(new RegExp("[\"|']" + originSearch + "[\"|']", 'gi'), function(match) {
	    	match = match.replace(match, "\"" + originWebserver + "\"");

	    	return match;
	    });
	}

    return target;
};


function AkPlugin(argv) {
	this.argv = argv;
	this.utils = new pluginUtils("steamer-plugin-ak");
	this.config = {
		zipFileName: "offline",   // zip folder and filename
		src: "dist",  			  // production code source folder
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
		}
	]).then((answers) => {
		this.getZipFileName(answers);
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
};

/**
 * [add mapping config]
 */
AkPlugin.prototype.inputConfig = function() {
	
	return inquirer.prompt([
		{
			type: "input",
			name: "src",
			message: "Your resource folder(e.g., cdn, webserver, cdn/js, cdn/css):",
		}, 
		{
			type: "input",
			name: "dest",
			default: "",
			message: "Your destination folder(e.g., /, /, js, css):",
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

	this.utils.createConfig(this.config, {
		overwrite: true
	});
};

/**
 * [read config]
 */
AkPlugin.prototype.readConfig = function() {
	this.config = this.utils.readConfig();
};

/**
 * [start zip file]
 */
AkPlugin.prototype.startZipFile = function() {
	this.readConfig();

	this.addDestUrl();

	this.copyFiles();

	this.excludeFiles();

	this.replaceUrl();

	this.zipFiles();
};

/**
 * [add destUrl property to config map data]
 */
AkPlugin.prototype.addDestUrl = function() {

	let hasWebserver = false,
		webServerConfig = {};

	this.config.map.map((item) => {

		if (item.isWebserver) {
			hasWebserver = true;
			webServerConfig = item;
		}

	});

	this.config.map.map((item) => {

		item.destUrl = item.url;

		if (hasWebserver && item.isSameOrigin) {
			item.destUrl = webServerConfig.url || "";
		}
	});

};

/**
 * [copy files to offline folder]
 */
AkPlugin.prototype.copyFiles = function() {
	
	let cwd = process.cwd();

	fs.removeSync(path.join(cwd, this.config.zipFileName));
	fs.removeSync(path.join(cwd, this.config.zipFileName + ".zip"));

	this.config.map.forEach((item) => {
		let srcPath = path.join(this.config.src, item.src);

		let url = item.destUrl.replace("http://", "").replace("https://", "").replace("//", "").replace(":", "/"),
			dest = item.dest || "";

		let destPath = path.resolve(cwd, this.config.zipFileName, url, dest);

		try {
			fs.copySync(srcPath, destPath);
			// utils.info(destPath + " is copied success!");
		}
		catch(e) {
			this.utils.error(e.stack);
		}
	});
};

/**
 * [remove exclude folder or files]
 */
AkPlugin.prototype.excludeFiles = function() {

	let cwd = process.cwd();

	this.config.map.forEach((item) => {

		let url = item.destUrl.replace("http://", "").replace("https://", "").replace("//", "").replace(":", "/"),
			dest = item.dest || "";

		let destPath = path.resolve(cwd, this.config.zipFileName, url, dest);

		if (!item.exclude || !item.exclude.length) {
			return;
		}

		// include folder itself
		let walkFiles = klawSync(destPath);
		walkFiles.unshift({path: destPath});

		walkFiles.forEach((file) => {

			// loop through exclude files patterns
			item.exclude.forEach((match) => {
				if (minimatch(file.path, match, {
					matchBase: true,
					dot: true
				})) {
					if (fs.existsSync(file.path)) {
						fs.removeSync(file.path);
					}
				}
			});
			
		});
	});
};

/**
 * [replace cdn url with webserver url]
 */
AkPlugin.prototype.replaceUrl = function() {
	let hasWebserver = false,
		hasCdn = false,
		webserverDestUrl = null,
		webserverUrl = null,
		cdnDestUrl = null,
		cdnUrl = null;

	this.config.map.forEach((item) => {
		if (item.isWebserver) {
			hasWebserver = true;
			webserverDestUrl = item.destUrl;
			webserverUrl = item.url;
		}

		if (item.isSameOrigin) {
			hasCdn = true;
			cdnDestUrl = item.destUrl;
			cdnUrl = item.url;
		}
	});

	if (hasWebserver && hasCdn) {

		function walkAndReplace(config, folder, extname) {
			try {
				let srcPath = path.join(config.zipFileName, folder);
				srcPath = path.resolve(srcPath.replace(":", "/"));

				let files = klawSync(srcPath);

				files = files.filter((item) => {
					return path.extname(item.path) === "." + extname;
				});

				files.map((item) => {
					let content = fs.readFileSync(item.path, "utf-8");
					content = content.replaceJsAll(cdnUrl, webserverUrl, extname);
					fs.writeFileSync(item.path, content, "utf-8");
				});
			}
			catch(e) {
				this.utils.error(e.stack);
			}
		}
		
		walkAndReplace(this.config, cdnDestUrl.replaceAll("//", ""), "js");
		walkAndReplace(this.config, webserverDestUrl.replaceAll("//", ""), "html");
	}
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

	output.on('close', () => {
		this.utils.info('\nZip file total size: ' + Math.floor(archive.pointer() / 1024) + 'KB\n');
	});

	// good practice to catch this error explicitly
	archive.on('error', (err) => {
		this.utils.error('error');
		throw err;
	});

	let zipFiles = klawSync(path.resolve(this.config.zipFileName), {nodir: true});

	// archive.directory('offline/');
	
	zipFiles.forEach((item) => {
		archive.file(item.path, { name: path.relative(this.config.zipFileName, item.path) });
	});

	// pipe archive data to the file
	archive.pipe(output);

	archive.finalize();

};


module.exports = AkPlugin;