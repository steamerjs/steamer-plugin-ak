module.exports = {
    "plugin": "steamer-plugin-ak",
    "config": {
        "zipFileName": "dist/offline",
        "src": "dist",
        "map": [
            {
                "src": "webserver",
                "dest": "",
                "url": "//huayang.qq.com/h5/"
            },
            {
                "src": "cdn",
                "dest": "",
                "url": "//s1.url.cn/h5/"
            }
        ],
        "zipConfig": {}
    }
};