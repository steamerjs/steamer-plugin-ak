'use strict';
const fs = require('fs'),
      path = require('path');

module.exports = {
    "plugin": "steamer-plugin-ak",
    "config": {
        "zipFileName": "dist/offline",
        "src": "dist",
        "map": [
            {
                "src": "webserver",
                "isWebserver": true,
                "url": "//huayang.qq.com/h5/",
            },
            {
                "src": "cdn/js",
                "dest": "js",
                "isSameOrigin": true,
                "url": "//s1.url.cn/h5/",
            },
            {
                "src": "cdn/css",
                "dest": "css",
                "url": "//s1.url.cn/h5/",
            },
            {
                "src": "cdn/img",
                "dest": "img",
                "url": "//s1.url.cn/h5/",
                "exclude": ["img"]
            }
        ],
        beforeCopy: function() {
            console.log("======beforeCopy=====");
            fs.writeFileSync(path.resolve("./dist/cdn/js/detail.js"), "hello man!", "utf-8");
        },
        afterCopy: function() {
            console.log("======afterCopy=====");
            fs.writeFileSync(path.resolve("./dist/cdn/js/comment.js"), "hello man!", "utf-8");
        },
        beforeZip: function() {
            console.log("======beforeZip=====");
        },
        afterZip: function() {
            console.log("======afterZip=====");
        }
    }
}