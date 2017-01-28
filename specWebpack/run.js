'use strict';

var robot = require("robotjs"),
	AK = require('../index'),
	spawnSync = require('child_process').spawnSync,
	Promise = require('bluebird');


new Promise((resolve, reject) => {
	// change directory
	process.chdir('specWebpack/sameorigin');

	var ak = new AK({
	    init: true
	});

	ak.addZipFileName();

	setTimeout(() => {
		robot.typeString("dist/offline");
		robot.keyTap("enter");
	}, 100);

	setTimeout(() => {
		robot.typeString("dist");
		robot.keyTap("enter");
	}, 200);

	setTimeout(() => {
		robot.typeString("y");
		robot.keyTap("enter");
	}, 300);

	setTimeout(() => {
		robot.typeString("webserver");
		robot.keyTap("enter");
	}, 400);

	setTimeout(() => {
		robot.typeString("//huayang.qq.com/h5/");
		robot.keyTap("enter");
	}, 500);

	setTimeout(() => {
		robot.typeString("cdn");
		robot.keyTap("enter");
	}, 600);

	setTimeout(() => {
		robot.typeString("//s1.url.cn/h5/");
		robot.keyTap("enter");
	}, 700);

	setTimeout(() => {
		robot.keyTap("enter");
	}, 800);

	setTimeout(() => {
		robot.keyTap("enter");
	}, 900);


	setTimeout(() => {
		ak.startZipFile();
		resolve();
	}, 1500);
}).then(() => {
	// change directory
	process.chdir('../not-sameorigin');

	var ak = new AK({
	    init: true
	});

	ak.addZipFileName();

	setTimeout(() => {
		robot.typeString("dist/offline");
		robot.keyTap("enter");
	}, 100);

	setTimeout(() => {
		robot.typeString("dist");
		robot.keyTap("enter");
	}, 200);

	setTimeout(() => {
		robot.typeString("n");
		robot.keyTap("enter");
	}, 300);

	setTimeout(() => {
		robot.typeString("webserver");
		robot.keyTap("enter");
	}, 400);

	setTimeout(() => {
		robot.typeString("//huayang.qq.com/h5/");
		robot.keyTap("enter");
	}, 500);

	setTimeout(() => {
		robot.typeString("cdn");
		robot.keyTap("enter");
	}, 600);

	setTimeout(() => {
		robot.typeString("//s1.url.cn/h5/");
		robot.keyTap("enter");
	}, 700);

	setTimeout(() => {
		robot.keyTap("enter");
	}, 800);

	setTimeout(() => {
		robot.keyTap("enter");
	}, 900);


	setTimeout(() => {
		ak.startZipFile();
	}, 1500);
});



