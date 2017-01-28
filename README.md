# steamer-plugin-ak

AlloyKit平台生成离线包命令

## 安装

```javascript
npm i -g steamerjs

npm i -g steamer-plugin-ak
```

## 使用

如果项目的生成环境的代码结构如下：

```javascript
-- dist
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

初始化：

```javascript
steamer ak -i

或

steamer ak -init

```

它会弹出下面的一些问题：

`Your zip file name`, 意思是最终生成的离线包名称，默认值是 `offline`。

`Your source folder`, 生成环境的代码源，上面的项目结构中是 `dist`，这也是默认值。

后面两个选项会一直循环出现，除非你输入空值，因为项目中可能有多个 `cdn` 对应多个静态资源。例如，你可能会用 `//huayang.qq.com/h5/` 给你的 `html` 文件，而用 `//s1.url.cn/h5/` 给你的其它静态资源。


```javascript
Your zip file name(e.g., offline): (offline)

Your source folder(e.g., build, pub, dist): (dist)

Whether to add webserver url for all resources: (No)

Your resource folder(e.g., cdn, cdn/js, cdn/css, webserver):

Your destination url(e.g.,//huayang.qq.com/h5/):
```

这里是配置文件的范例 (.steamer/steamer-plugin-ak.js).

```javascript
module.exports = {
    "plugin": "steamer-plugin-ak",
    "config": {
        "zipFileName": "dist/offline",
        "src": "dist",
        "isSameOrigin": true,
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
```

然而，有时候你会对 `html` 以外的静态资源再进行细分，使用不同的 `cdn` 域名，例如 `//s1.url.cn/h5/` 给你的 `js`文件，用 `//s2.url.cn/h5/` 给 `css` 文件， 然后用 `//s3.url.cn/h5/` 给其它的文件。

Here is another example config.

```javascript
module.exports = {
    "plugin": "steamer-plugin-ak",
    "config": {
        "zipFileName": "dist/offline",
        "src": "dist",
        "isSameOrigin": false,
        "map": [
        {
            "src": "cdn/js",
            "url": "//s1.url.cn/h5/"
        },
        {
            "src": "cdn/css",
            "url": "//s2.url.cn/h5/"
        },
        {
            "src": "cdn/img",
            "url": "//s3.url.cn/h5/"
        },
        {
            "src": "cdn/lib",
            "url": "//s3.url.cn/h5/"
        },
        {
            "src": "webserver",
            "url": "//huayang.qq.com/h5/"
        }
    ]
    }
}
```
下面的命令，会进行压缩，并生成 `offline` 文件夹，还有 `offline.zip` 文件。

```javascript
steamer ak -c

or

steamer ak -compress
```

有时候，你想通过离线包收集一些报错的信息，奈何使用了不同的域名，会有跨域的问题，返回的报错总是 `script error`。你可以通过离线包去处理这件事。如果你配置了 `cdn` 和 `webserver` 两种 `src`，并且 `isSameOrigin` 配置为 `true`，那么程序会自动帮你将 `cdn`的 `url` 全部替换成 `webserver` 本身的 `url`。