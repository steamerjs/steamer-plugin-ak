module.exports = {
    "plugin": "steamer-plugin-ak",
    "config": {
        "zipFileName": "dist/offline",
        "src": "dist",
        "isSameOrigin": false,
        "map": [
            {
                "src": "webserver",
                "url": "//huayang.qq.com/h5/"
            },
            {
                "src": "cdn",
                "url": "//s1.url.cn/h5/"
            }
        ]
    }
}