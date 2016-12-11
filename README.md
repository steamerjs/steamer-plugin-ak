### steamer-plugin-ak

Create zip package for ak platform

#### Installation

```javascript
npm i -g steamer-cli

npm i -g steamer-plugin-ak
```

#### Usage

In a project, if the production code folder structure is like this:

```
-- build
	|
	-- cdn
	|	|
	|	|-- css
	|	|-- img
	|	|-- js
	|
	-- webserver
		|-- index.html
		|-- detail.html
		|-- comment.html
```

For initiation:

```javascript
steamer ak -i

or 

steamer ak -init

```

It will prompt some questions for you as follows. 

Your zip file name means the final zip file name you wanna create. Default value is `offline`.

Your source folder, that should be the source production code. For the above example, it should be `build` which is also the default value.

The next two questions won't stop until you type empty string because you may have multiple mappings. For example, you will hope to use `huayang.qq.com/h5/` for your html files in `webserver` folder, then use `s1.url.cn/h5/` for your cdn files. 


```javascript
Your zip file name(e.g., offline): (offline)

Your source folder(e.g., build, pub, dist): (build)

Your resource folder(e.g., cdn, cdn/js, cdn/css, webserver):

Your destination url(e.g.,huayang.qq.com/h5/):
```

Here is an example config file (.steamer/steamer-plugin-ak.js).

```javascript
module.exports = {
    "plugin": "steamer-plugin-ak",
    "config": {
        "zip": "offline",
        "source": "build",
        "map": [
            {
                "src": "webserver",
                "url": "s1.url.cn/huayang/"
            },
            {
                "src": "cdn",
                "url": "huayang.qq.com/huayang/activity/"
            }
        ]
    }
}
```

However, sometimes, you may also hope to use more than one cdn urls. For instance, `s1.url.cn/h5/` for js files, `s2.url.cn/h5/` for css files and `s3.url.cn/h5/` for rest files.

Here is another example config.

```javascript
module.exports = {
    "plugin": "steamer-plugin-ak",
    "config": {
        "zip": "offline",
        "source": "build",
        "map": [
        {
            "src": "cdn/js",
            "url": "s1.url.cn/huayang/"
        },
        {
            "src": "cdn/css",
            "url": "s2.url.cn/huayang/"
        },
        {
            "src": "cdn/img",
            "url": "s3.url.cn/huayang/"
        },
        {
            "src": "cdn/lib",
            "url": "s3.url.cn/huayang/"
        },
        {
            "src": "webserver",
            "url": "huayang.qq.com/huayang/activity/"
        }
    ]
    }
}
```

For compression, use the following command. Then, folder `offline` and zip file `offline.zip` are created.

```javascript
steamer ak -c

or

steamer ak -compress
```

For cross origin issue, you may need to replace `cdn` url with `webserver` url. If your build folder contains `cdn` and `webserver` and you set mapping for both folder as follows, this feature can be used.

```javascript
module.exports = {
    "plugin": "steamer-plugin-ak",
    "config": {
        "zip": "offline",
        "source": "build",
        "map": [
            {
                "src": "webserver",
                "url": "s1.url.cn/huayang/"
            },
            {
                "src": "cdn",
                "url": "huayang.qq.com/huayang/activity/"
            }
        ]
    }
}
```

```javascript
steamer ak -c -s

or 

steamer ak --compress --sameorigin
```