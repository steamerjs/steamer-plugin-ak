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
        ]
    }
}