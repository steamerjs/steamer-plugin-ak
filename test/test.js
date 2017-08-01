"use strict";

const path = require('path'),
      decompress = require('decompress'),
      fs = require('fs-extra'),
      chalk = require('chalk'),
      expect = require('expect.js'),
      sinon = require('sinon'),
      spawnSync = require('child_process').spawnSync,
      plugin = require('../index');

const PROJECT = path.join(process.cwd(), "test/project/");

function userInput(key, val, order) {
    setTimeout(function () {
        process.stdin.emit(key, val);
    }, order * 200);
}

function userInputEnd(cb, order) {
    setTimeout(function () {
        cb();
    }, order * 200);
}

describe("not-sameorigin", function() {

    before(function() {

        process.chdir(path.join(PROJECT, '/not-sameorigin'));

        fs.removeSync(path.join(PROJECT, '/not-sameorigin/dist/unzip'));
        fs.removeSync(path.join(PROJECT, '/not-sameorigin/dist/offline'));
        fs.removeSync(path.join(PROJECT, '/not-sameorigin/dist/offline.zip'));

        var ak = new plugin({
            compress: true
        });

        ak.init();

    });

    it("=> check offline folder", function(done) {

        this.timeout(10000);

        expect(fs.existsSync(path.join(PROJECT, '/not-sameorigin/dist/offline.zip'))).to.be(true);
        
        var offline = path.join(PROJECT, '/not-sameorigin/dist/offline'),
            offlineFolder = fs.readdirSync(offline);

        expect(offlineFolder[0]).to.be('huayang.qq.com');
        expect(offlineFolder[1]).to.be('s1.url.cn');

        var huayang = path.join(PROJECT, '/not-sameorigin/dist/offline/huayang.qq.com'),
            huayangFolder = fs.readdirSync(huayang);
        
        expect(huayangFolder[0]).to.be('h5');

        var h5 = path.join(PROJECT, '/not-sameorigin/dist/offline/huayang.qq.com/h5'),
            h5Folder = fs.readdirSync(h5);

        expect(h5Folder[0]).to.be('entry.html');
        expect(h5Folder[1]).to.be('index.html');

        var s1 = path.join(PROJECT, '/not-sameorigin/dist/offline/s1.url.cn'),
            s1Folder = fs.readdirSync(s1);

        expect(s1Folder[0]).to.be("h5");

        var h5 = path.join(PROJECT, '/not-sameorigin/dist/offline/s1.url.cn/h5'),
            jsFolder = fs.readdirSync(path.join(h5, 'js')),
            cssFolder = fs.readdirSync(path.join(h5, 'css'));

        expect(jsFolder[0]).to.be('index.js');
        expect(jsFolder[1]).to.be('libs');
        expect(cssFolder[0]).to.be('index.css');

        var libs = path.join(PROJECT, '/not-sameorigin/dist/offline/s1.url.cn/h5/js/libs/'),
            libsFolder = fs.readdirSync(libs);

        expect(libsFolder[0]).to.be('react.js');

        setTimeout(() => {
            decompress(path.resolve('dist/offline.zip'), path.resolve('dist/unzip')).then(files => {
                let filesArr = [];

                files.map((item) => {
                    filesArr.push(item.path);
                });

                expect(!!~filesArr.indexOf('huayang.qq.com/h5/entry.html')).to.be(true);
                expect(!!~filesArr.indexOf('huayang.qq.com/h5/index.html')).to.be(true);
                expect(!!~filesArr.indexOf('s1.url.cn/h5/css/index.css')).to.be(true);
                expect(!!~filesArr.indexOf('s1.url.cn/h5/js/index.js')).to.be(true);
                expect(!!~filesArr.indexOf('s1.url.cn/h5/js/libs/react.js')).to.be(true);
                
                done();
            }).catch((e) => {
                console.log(e);
                done();
            });
        }, 2000);
        
    });
});

describe("not-sameorigin1", function() {
    
    before(function(done) {

        this.timeout(10000);

        process.chdir(path.join(PROJECT, '/not-sameorigin1'));

        fs.removeSync(path.join(PROJECT, '/not-sameorigin1/dist/unzip'));
        fs.removeSync(path.join(PROJECT, '/not-sameorigin1/dist/offline'));
        fs.removeSync(path.join(PROJECT, '/not-sameorigin1/dist/offline.zip'));

        var ak = new plugin({
            init: true
        });

        ak.init();

        userInput("data", "dist/offline\n", 1);
        userInput("data", "dist\n", 2);
        userInput("data", "webserver\n", 3);
        userInput("data", "\n", 4);
        userInput("data", "//huayang.qq.com/h5/\n", 5);
        userInput("data", "cdn\n", 6);
        userInput("data", "\n", 7);
        userInput("data", "//s1.url.cn/h5/\n", 8);
        userInput("data", "\n", 9);
        userInput("data", "\n", 10);
        userInput("data", "\n", 11);

        userInputEnd(function(){
            ak.startZipFile();
            done();
        }, 12);

    });

    it("=> check offline folder", function(done) {

        this.timeout(10000);

        expect(fs.existsSync(path.join(PROJECT, '/not-sameorigin1/dist/offline.zip'))).to.be(true);
        
        var offline = path.join(PROJECT, '/not-sameorigin1/dist/offline'),
            offlineFolder = fs.readdirSync(offline);

        expect(offlineFolder[0]).to.be('huayang.qq.com');
        expect(offlineFolder[1]).to.be('s1.url.cn');

        var huayang = path.join(PROJECT, '/not-sameorigin1/dist/offline/huayang.qq.com'),
            huayangFolder = fs.readdirSync(huayang);
        
        expect(huayangFolder[0]).to.be('h5');

        var h5 = path.join(PROJECT, '/not-sameorigin1/dist/offline/huayang.qq.com/h5'),
            h5Folder = fs.readdirSync(h5);

        expect(h5Folder[0]).to.be('entry.html');
        expect(h5Folder[1]).to.be('index.html');

        var s1 = path.join(PROJECT, '/not-sameorigin1/dist/offline/s1.url.cn'),
            s1Folder = fs.readdirSync(s1);

        expect(s1Folder[0]).to.be("h5");

        var h5 = path.join(PROJECT, '/not-sameorigin1/dist/offline/s1.url.cn/h5'),
            jsFolder = fs.readdirSync(path.join(h5, 'js')),
            cssFolder = fs.readdirSync(path.join(h5, 'css'));

        expect(jsFolder[0]).to.be('index.js');
        expect(jsFolder[1]).to.be('libs');
        expect(cssFolder[0]).to.be('index.css');

        var libs = path.join(PROJECT, '/not-sameorigin1/dist/offline/s1.url.cn/h5/js/libs/'),
            libsFolder = fs.readdirSync(libs);

        expect(libsFolder[0]).to.be('react.js');

        setTimeout(() => {
            decompress(path.join(PROJECT, '/not-sameorigin1/dist/offline.zip'), path.join(PROJECT, '/not-sameorigin1/dist/unzip')).then(files => {
                let filesArr = [];

                files.map((item) => {
                    filesArr.push(item.path);
                });

                expect(!!~filesArr.indexOf('huayang.qq.com/h5/entry.html')).to.be(true);
                expect(!!~filesArr.indexOf('huayang.qq.com/h5/index.html')).to.be(true);
                expect(!!~filesArr.indexOf('s1.url.cn/h5/css/index.css')).to.be(true);
                expect(!!~filesArr.indexOf('s1.url.cn/h5/js/index.js')).to.be(true);
                expect(!!~filesArr.indexOf('s1.url.cn/h5/js/libs/react.js')).to.be(true);
                expect(!!~filesArr.indexOf('s1.url.cn/h5/img/adidas.jpg')).to.be(true);
                expect(!!~filesArr.indexOf('s1.url.cn/h5/img/google.jpg')).to.be(true);
                expect(!!~filesArr.indexOf('s1.url.cn/h5/img/ibm.jpg')).to.be(true);
                
                done();
            }).catch((e) => {
                console.log(e);
                done();
            });
        }, 2000);
        
    });
});

describe("resource-sameorigin", function(done) {

    before(function() {

        process.chdir(path.join(PROJECT, '/sameorigin'));

        // fs.removeSync(path.join(PROJECT, '/sameorigin/dist/unzip'));
        fs.removeSync(path.join(PROJECT, '/sameorigin/dist/offline'));
        fs.removeSync(path.join(PROJECT, '/sameorigin/dist/offline.zip'));

        this.timeout(10000);

        var ak = new plugin({
            compress: true
        });

        ak.init();

    });

    after(function() {
        fs.removeSync(path.join(PROJECT, '/sameorigin/dist/cdn/js/detail.js'));
        fs.removeSync(path.join(PROJECT, '/sameorigin/dist/cdn/js/comment.js'));
    });

    it("=> check offline folder with same origin js files", function(done) {

        this.timeout(10000);

        expect(fs.existsSync(path.join(PROJECT, '/sameorigin/dist/offline.zip'))).to.be(true);
        
        var offline = path.join(PROJECT, '/sameorigin/dist/offline'),
            offlineFolder = fs.readdirSync(offline);

        expect(offlineFolder[0]).to.be('huayang.qq.com');
        expect(offlineFolder[1]).to.be('s1.url.cn');

        var huayang = path.join(PROJECT, '/sameorigin/dist/offline/huayang.qq.com'),
            huayangFolder = fs.readdirSync(huayang);
        
        expect(huayangFolder[0]).to.be('h5');

        var h5 = path.join(PROJECT, '/sameorigin/dist/offline/huayang.qq.com/h5'),
            h5Folder = fs.readdirSync(h5),
            jsFolder = fs.readdirSync(path.join(h5, 'js'));

        expect(h5Folder[0]).to.be('entry.html');
        expect(h5Folder[1]).to.be('index.html');
        expect(jsFolder[0]).to.be('detail.js');
        expect(jsFolder[1]).to.be('index.js');
        expect(jsFolder[2]).to.be('libs');

        var libs = path.join(PROJECT, '/sameorigin/dist/offline/huayang.qq.com/h5/js/libs/'),
            libsFolder = fs.readdirSync(libs);

        expect(libsFolder[0]).to.be('react.js');

        var s1 = path.join(PROJECT, '/sameorigin/dist/offline/s1.url.cn'),
            s1Folder = fs.readdirSync(s1);

        expect(s1Folder[0]).to.be("h5");

        var h5 = path.join(PROJECT, '/sameorigin/dist/offline/s1.url.cn/h5'),
            cssFolder = fs.readdirSync(path.join(h5, 'css'));

        expect(cssFolder[0]).to.be('index.css');

        var htmlContent = fs.readFileSync(path.join(PROJECT, '/sameorigin/dist/offline/huayang.qq.com/h5/entry.html'), "utf-8");

        var matchCount = 0;
        htmlContent.replace(new RegExp("(<script[^>]*src=([\'\"]*)(.*?)([\'\"]*).*?\>(<\/script>)?)", 'gi'), function(match) {
            if (!!~match.indexOf('huayang.qq.com/h5')) {
                matchCount++;
            }
        });

        expect(matchCount).to.be(2);


        matchCount = 0;
        var jsContent = fs.readFileSync(path.join(PROJECT, '/sameorigin/dist/offline/huayang.qq.com/h5/js/index.js'), "utf-8");
        
        jsContent.replace(new RegExp("huayang.qq.com\/h5(\\\/(\\w){0,})+(.js)", 'gi'), function(match) {
            matchCount++;
        });

        jsContent.replace(new RegExp("[\"|']\/\/huayang.qq.com\/h5\/[\"|']", 'gi'), function(match) {
            matchCount++;
        });

        expect(matchCount).to.be(2);

        matchCount = 0;
        var jsContent = fs.readFileSync(path.join(PROJECT, '/sameorigin/dist/offline/huayang.qq.com/h5/js/libs/react.js'), "utf-8");

        jsContent.replace(new RegExp("[\"|']\/\/huayang.qq.com\/h5\/[\"|']", 'gi'), function(match) {
            matchCount++;
        });

        expect(matchCount).to.be(1);

        setTimeout(() => {
            decompress(path.join(PROJECT, '/sameorigin/dist/offline.zip'), path.join(PROJECT, '/sameorigin/dist/unzip')).then(files => {
                let filesArr = [];

                files.map((item) => {
                    filesArr.push(item.path);
                });
                
                expect(!!~filesArr.indexOf('huayang.qq.com/h5/entry.html')).to.be(true);
                expect(!!~filesArr.indexOf('huayang.qq.com/h5/index.html')).to.be(true);
                expect(!!~filesArr.indexOf('s1.url.cn/h5/css/index.css')).to.be(true);
                expect(!!~filesArr.indexOf('huayang.qq.com/h5/js/index.js')).to.be(true);
                expect(!!~filesArr.indexOf('huayang.qq.com/h5/js/libs/react.js')).to.be(true);
                expect(!!~filesArr.indexOf('s1.url.cn/h5/img')).to.be(false);

                done();
            });
        }, 2000);

    });
});

describe("resource-sameorigin-uglify", function(done) {

    before(function() {

        process.chdir(path.join(PROJECT, '/sameorigin-uglify'));

        // fs.removeSync(path.join(PROJECT, '/sameorigin/dist/unzip'));
        fs.removeSync(path.join(PROJECT, '/sameorigin-uglify/dist/offline'));
        fs.removeSync(path.join(PROJECT, '/sameorigin-uglify/dist/offline.zip'));

        this.timeout(10000);

        var ak = new plugin({
            compress: true
        });

        ak.init();

    });

    it("=> check offline folder with same origin js files", function(done) {

        this.timeout(10000);

        expect(fs.existsSync(path.join(PROJECT, '/sameorigin-uglify/dist/offline.zip'))).to.be(true);
        
        var offline = path.join(PROJECT, '/sameorigin-uglify/dist/offline'),
            offlineFolder = fs.readdirSync(offline);

        expect(offlineFolder[0]).to.be('huayang.qq.com');
        expect(offlineFolder[1]).to.be('s1.url.cn');

        var huayang = path.join(PROJECT, '/sameorigin-uglify/dist/offline/huayang.qq.com'),
            huayangFolder = fs.readdirSync(huayang);
        
        expect(huayangFolder[0]).to.be('h5');

        var h5 = path.join(PROJECT, '/sameorigin-uglify/dist/offline/huayang.qq.com/h5'),
            h5Folder = fs.readdirSync(h5),
            jsFolder = fs.readdirSync(path.join(h5, 'js'));

        expect(h5Folder[0]).to.be('entry.html');
        expect(h5Folder[1]).to.be('js');
        expect(jsFolder[0]).to.be('index.js');
        expect(jsFolder[1]).to.be('libs');

        var libs = path.join(PROJECT, '/sameorigin-uglify/dist/offline/huayang.qq.com/h5/js/libs/'),
            libsFolder = fs.readdirSync(libs);

        expect(libsFolder[0]).to.be('react.js');

        var s1 = path.join(PROJECT, '/sameorigin-uglify/dist/offline/s1.url.cn'),
            s1Folder = fs.readdirSync(s1);

        expect(s1Folder[0]).to.be("h5");

        var h5 = path.join(PROJECT, '/sameorigin-uglify/dist/offline/s1.url.cn/h5'),
            cssFolder = fs.readdirSync(path.join(h5, 'css'));

        expect(cssFolder[0]).to.be('index.css');

        var htmlContent = fs.readFileSync(path.join(PROJECT, '/sameorigin-uglify/dist/offline/huayang.qq.com/h5/entry.html'), "utf-8");

        var matchCount = 0;

        htmlContent.replace(new RegExp("(<script[^>]*src=([\'\"]*)(.*?)([\'\"]*).*?\>(<\/script>)?)", 'gi'), function(match) {
            if (!!~match.indexOf('huayang.qq.com/h5')) {
                matchCount++;
            }
        });

        expect(matchCount).to.be(2);


        matchCount = 0;
        var jsContent = fs.readFileSync(path.join(PROJECT, '/sameorigin-uglify/dist/offline/huayang.qq.com/h5/js/index.js'), "utf-8");
        
        jsContent.replace(new RegExp("huayang.qq.com\/h5(\\\/(\\w){0,})+(.js)", 'gi'), function(match) {
            matchCount++;
        });

        jsContent.replace(new RegExp("[\"|']\/\/huayang.qq.com\/h5\/[\"|']", 'gi'), function(match) {
            matchCount++;
        });

        expect(matchCount).to.be(2);

        matchCount = 0;
        var jsContent = fs.readFileSync(path.join(PROJECT, '/sameorigin-uglify/dist/offline/huayang.qq.com/h5/js/libs/react.js'), "utf-8");

        jsContent.replace(new RegExp("[\"|']\/\/huayang.qq.com\/h5\/[\"|']", 'gi'), function(match) {
            matchCount++;
        });

        expect(matchCount).to.be(1);

        setTimeout(() => {
            decompress(path.join(PROJECT, '/sameorigin-uglify/dist/offline.zip'), path.join(PROJECT, '/sameorigin-uglify/dist/unzip')).then(files => {
                let filesArr = [];

                files.map((item) => {
                    filesArr.push(item.path);
                });
                
                expect(!!~filesArr.indexOf('huayang.qq.com/h5/entry.html')).to.be(true);
                expect(!!~filesArr.indexOf('s1.url.cn/h5/css/index.css')).to.be(true);
                expect(!!~filesArr.indexOf('huayang.qq.com/h5/js/index.js')).to.be(true);
                expect(!!~filesArr.indexOf('huayang.qq.com/h5/js/libs/react.js')).to.be(true);
                expect(!!~filesArr.indexOf('s1.url.cn/h5/img')).to.be(false);

                done();
            }).catch((e) => {
                console.log(e);
                done();
            });
        }, 2000);

    });
});