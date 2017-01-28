"use strict";

const path = require('path'),
	  fs = require('fs'),
      AK = require('../index');


describe("offline", function() {
  	it("=> sameorigin", function() {

        let ak = new AK({
            init: true
        });

  		expect(fs.existsSync('specWebpack/sameorigin/dist/offline.zip')).toBe(true);
  		
  		var offline = path.resolve('specWebpack/sameorigin/dist/offline'),
  			domain = fs.readdirSync(offline);

    	expect(domain[0]).toBe('huayang.qq.com');
        expect(domain[1]).toBe('s1.url.cn');

    	var htmlFolder = path.resolve('specWebpack/sameorigin/dist/offline/huayang.qq.com/h5/'),
    		htmlFile = fs.readdirSync(htmlFolder);

    	expect(htmlFile[0]).toBe('entry.html');

    	var cdnFolder = path.resolve('specWebpack/sameorigin/dist/offline/s1.url.cn/h5/'),
    		jsFolder = fs.readdirSync(path.join(cdnFolder, 'js')),
    		cssFolder = fs.readdirSync(path.join(cdnFolder, 'css'));

    	expect(jsFolder[0]).toBe('index.js');
    	expect(jsFolder[1]).toBe('libs');
    	expect(cssFolder[0]).toBe('index.css');

    	var libs = path.resolve('specWebpack/sameorigin/dist/offline/s1.url.cn/h5/js/libs/'),
    	    libsFolder = fs.readdirSync(libs);

    	expect(libsFolder[0]).toBe('react.js');

        var htmlFileContent1 = fs.readFileSync('specWebpack/sameorigin/dist/offline/huayang.qq.com/h5/entry.html', 'utf-8');
        var htmlFileContent2 = fs.readFileSync('specWebpack/sameorigin/dist/offline/huayang.qq.com/h5/index.html', 'utf-8');
        
        expect(!!~htmlFileContent1.indexOf('huayang.qq.com')).toBe(true);
        expect(!!~htmlFileContent2.indexOf('huayang.qq.com')).toBe(true);

  	});

    it("=> not sameorigin", function() {

        let ak = new AK({
            init: true
        });

        expect(fs.existsSync('specWebpack/not-sameorigin/dist/offline.zip')).toBe(true);
        
        var offline = path.resolve('specWebpack/not-sameorigin/dist/offline'),
            domain = fs.readdirSync(offline);

        expect(domain[0]).toBe('huayang.qq.com');
        expect(domain[1]).toBe('s1.url.cn');

        var htmlFolder = path.resolve('specWebpack/not-sameorigin/dist/offline/huayang.qq.com/h5/'),
            htmlFile = fs.readdirSync(htmlFolder);

        expect(htmlFile[0]).toBe('entry.html');

        var cdnFolder = path.resolve('specWebpack/not-sameorigin/dist/offline/s1.url.cn/h5/'),
            jsFolder = fs.readdirSync(path.join(cdnFolder, 'js')),
            cssFolder = fs.readdirSync(path.join(cdnFolder, 'css'));

        expect(jsFolder[0]).toBe('index.js');
        expect(jsFolder[1]).toBe('libs');
        expect(cssFolder[0]).toBe('index.css');

        var libs = path.resolve('specWebpack/not-sameorigin/dist/offline/s1.url.cn/h5/js/libs/'),
            libsFolder = fs.readdirSync(libs);

        expect(libsFolder[0]).toBe('react.js');

        var htmlFileContent = fs.readFileSync('specWebpack/not-sameorigin/dist/offline/huayang.qq.com/h5/entry.html', 'utf-8');
        
        expect(!!~htmlFileContent.indexOf('s1.url.cn')).toBe(true);

    });
});