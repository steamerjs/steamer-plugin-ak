"use strict";

const path = require('path'),
      fs = require('fs');


describe("not-sameorigin", function() {
    it("=> check offline folder", function() {

        expect(fs.existsSync('specPlugin/not-sameorigin/dist/offline.zip')).toBe(true);
        
        var offline = path.resolve('specPlugin/not-sameorigin/dist/offline'),
            offlineFolder = fs.readdirSync(offline);

        expect(offlineFolder[0]).toBe('huayang.qq.com');
        expect(offlineFolder[1]).toBe('s1.url.cn');

        var huayang = path.resolve('specPlugin/not-sameorigin/dist/offline/huayang.qq.com'),
            huayangFolder = fs.readdirSync(huayang);
        
        expect(huayangFolder[0]).toBe('h5');

        var h5 = path.resolve('specPlugin/not-sameorigin/dist/offline/huayang.qq.com/h5'),
            h5Folder = fs.readdirSync(h5);

        expect(h5Folder[0]).toBe('entry.html');
        expect(h5Folder[1]).toBe('index.html');

        var s1 = path.resolve('specPlugin/not-sameorigin/dist/offline/s1.url.cn'),
            s1Folder = fs.readdirSync(s1);

        expect(s1Folder[0]).toBe("h5");

        var h5 = path.resolve('specPlugin/not-sameorigin/dist/offline/s1.url.cn/h5'),
            jsFolder = fs.readdirSync(path.join(h5, 'js')),
            cssFolder = fs.readdirSync(path.join(h5, 'css'));

        expect(jsFolder[0]).toBe('index.js');
        expect(jsFolder[1]).toBe('libs');
        expect(cssFolder[0]).toBe('index.css');

        var libs = path.resolve('specPlugin/not-sameorigin/dist/offline/s1.url.cn/h5/js/libs/'),
            libsFolder = fs.readdirSync(libs);

        expect(libsFolder[0]).toBe('react.js');
    });
});

describe("resource-sameorigin", function() {
    it("=> check offline folder with same origin js files", function() {

        expect(fs.existsSync('specPlugin/sameorigin/dist/offline.zip')).toBe(true);
        
        var offline = path.resolve('specPlugin/sameorigin/dist/offline'),
            offlineFolder = fs.readdirSync(offline);

        expect(offlineFolder[0]).toBe('huayang.qq.com');
        expect(offlineFolder[1]).toBe('s1.url.cn');

        var huayang = path.resolve('specPlugin/sameorigin/dist/offline/huayang.qq.com'),
            huayangFolder = fs.readdirSync(huayang);
        
        expect(huayangFolder[0]).toBe('h5');

        var h5 = path.resolve('specPlugin/sameorigin/dist/offline/huayang.qq.com/h5'),
            h5Folder = fs.readdirSync(h5),
            jsFolder = fs.readdirSync(path.join(h5, 'js'));

        expect(h5Folder[0]).toBe('entry.html');
        expect(h5Folder[1]).toBe('index.html');
        expect(jsFolder[0]).toBe('index.js');
        expect(jsFolder[1]).toBe('libs');

        var libs = path.resolve('specPlugin/sameorigin/dist/offline/huayang.qq.com/h5/js/libs/'),
            libsFolder = fs.readdirSync(libs);

        expect(libsFolder[0]).toBe('react.js');

        var s1 = path.resolve('specPlugin/sameorigin/dist/offline/s1.url.cn'),
            s1Folder = fs.readdirSync(s1);

        expect(s1Folder[0]).toBe("h5");

        var h5 = path.resolve('specPlugin/sameorigin/dist/offline/s1.url.cn/h5'),
            cssFolder = fs.readdirSync(path.join(h5, 'css'));

        expect(cssFolder[0]).toBe('index.css');

        var htmlContent = fs.readFileSync(path.resolve('specPlugin/sameorigin/dist/offline/huayang.qq.com/h5/entry.html'), "utf-8");

        var matchCount = 0;
        htmlContent.replace(new RegExp("(.\\\s*)huayang.qq.com\/h5\/(.*)(.js)", 'gi'), function(match) {
            matchCount++;
        });

        expect(matchCount).toBe(2);

        var htmlContent = fs.readFileSync(path.resolve('specPlugin/sameorigin/dist/offline/huayang.qq.com/h5/index.html'), "utf-8");

        var matchCount = 0;
        htmlContent.replace(new RegExp("(.\\\s*)huayang.qq.com\/h5\/(.*)(.js)", 'gi'), function(match) {
            matchCount++;
        });

        expect(matchCount).toBe(2);

    });
});