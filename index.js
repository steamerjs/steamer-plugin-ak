"use strict";

const inquirer = require('inquirer'),
	  path = require('path'),
	  fs = require('fs-extra'),
	  archiver = require('archiver');

function AkPlugin(argv) {
	this.argv = argv;
	this.configFile = path.join(".steamer/steamer-plugin-ak.js");
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
	    	console.log(this.config);
	    	this.createConfig();
	    }
	});
};

AkPlugin.prototype.createConfig = function() {
	let localConfig = JSON.stringify(this.config, null, 4);
	fs.ensureFileSync(this.configFile);
	fs.writeFileSync(this.configFile, localConfig, 'utf-8');
};

AkPlugin.prototype.startZipFile = function() {
	this.readConfig();
	this.copyFiles();

	if (this.argv.sameorigin || this.argv.s) {
		this.replaceUrl();
	}

	this.zipFiles();
};

AkPlugin.prototype.readConfig = function() {
	if (!fs.existsSync(this.configFile)) {
		throw new Error("Config file not exists");
	}

	this.config = JSON.parse(fs.readFileSync(this.configFile, "utf-8"));
};

AkPlugin.prototype.copyFiles = function() {
	
	fs.removeSync(path.resolve(this.config.zip));

	this.config.map.forEach((item, key) => {
		let srcPath = path.join(this.config.source, item.src);
		if (!fs.existsSync(this.configFile)) {
			throw new Error("Source folder/file" + srcPath + " not exists");
		}

		let url = item.url.replace("http://", "").replace("https://", "").replace("//", "");

		let destPath = path.join(this.config.zip, url, item.src);

		fs.copySync(srcPath, destPath);

		console.log(destPath + " is copied success!");
	});
};

AkPlugin.prototype.replaceUrl = function() {
	// TODO: replace js url to ensure same origin
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