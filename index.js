const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs-extra');
const klawSync = require('klaw-sync');
const archiver = require('archiver');
const minimatch = require('minimatch');
const SteamerPlugin = require('steamer-plugin');
const glob = require('glob');

String.prototype.replaceAll = function (search, replacement) {
    let target = this;
    return target.replace(new RegExp(search, 'gi'), replacement);
};

function emptyFunc() {}

String.prototype.replaceJsAll = function (search, replacement, extension) {
    let target = this,
        originSearch = search,
        originWebserver = replacement,
        cdnUrl = search.replace('//', ''),
        webserverUrl = replacement.replace('//', '');

    search = search.replace('//', '');
    if (search[search.length - 1] === '/') {
        search = search.substr(0, search.length - 1);
    }

    if (extension === 'html') {
        target = target.replace(new RegExp('(<script[^>]*src=([\'\"]*)(.*?)([\'\"]*).*?\>(<\/script>)?)', 'gi'), function (match) {
            if (~match.indexOf(cdnUrl)) {
                match = match.replace(cdnUrl, webserverUrl);
            }
            return match;
        });
    }
    else if (extension === 'js') {
        target = target.replace(new RegExp(search + '(\\\/(\\w){0,})+(.js)', 'gi'), function (match) {
            match = match.replace(cdnUrl, webserverUrl);
            return match;
        });

        target = target.replace(new RegExp("[\"|']" + originSearch + "[\"|']", 'gi'), function (match) {
            match = match.replace(match, '"' + originWebserver + '"');

            return match;
        });
    }

    return target;
};

class AkPlugin extends SteamerPlugin {
    constructor(args) {
        super(args);
        this.argv = args;
        this.pluginName = 'steamer-plugin-ak';
        this.description = 'pack files for alloykit system';
        this.config = {
            zipFileName: 'offline',   // zip folder and filename
            src: 'dist', // production code source folder
            map: [], // folder and url mapping
            zipConfig: {},
        };
        this.fs = fs;
    }

    init() {
        let argv = this.argv;

        if (argv.init || argv.i) {
            this.addZipFileName();
        }
        else if (argv.compress || argv.c) {
            this.startZipFile();
        }
    }

    getZipFileName(answers) {
        this.config.zipFileName = answers.zipFileName;
        this.config.src = answers.src;
        this.inputConfig();
    }

    /**
     * [add zip file name]
     */
    addZipFileName() {
        return inquirer.prompt([
            {
                type: 'input',
                name: 'zipFileName',
                default: 'offline',
                message: 'Your zip file name(e.g., offline):',
            },
            {
                type: 'input',
                name: 'src',
                default: 'dist',
                message: 'Your source folder(e.g., build, pub, dist):',
            }
        ]).then((answers) => {
            this.getZipFileName(answers);
        });
        // .catch((e) => {
        //     this.error(e.stack);
        // });
    }

    getConfig(answers) {
        if (answers.src.trim() !== '' && answers.url.trim() !== '') {
            this.config.map.push(answers);
            this.inputConfig();
        }
        else {
            // not stop until empty input
            console.log('\n');
            this.createConfig();
        }
    }

    /**
     * [add mapping config]
     */
    inputConfig() {

        return inquirer.prompt([
            {
                type: 'input',
                name: 'src',
                message: 'Your resource folder(e.g., cdn, webserver, cdn/js, cdn/css):',
            },
            {
                type: 'input',
                name: 'dest',
                default: '',
                message: 'Your destination folder(e.g., /, /, js, css):',
            },
            {
                type: 'input',
                name: 'url',
                message: 'Your destination url(e.g.,//huayang.qq.com/h5/):',
            }
        ]).then((answers) => {
            this.getConfig(answers);
        });
        // .catch((e) => {
        //     this.error(e.stack);
        // });
    }

    /**
     * [create config]
     */
    createConfig() {

        this.createConfig(this.config, {
            overwrite: true
        });
    }

    /**
     * [read config]
     */
    readPluginConfig() {
        this.config = this.readConfig();
        this.config.beforeCopy = this.config.beforeCopy || emptyFunc;
        this.config.afterCopy = this.config.afterCopy || emptyFunc;
        this.config.beforeZip = this.config.beforeZip || emptyFunc;
        this.config.afterZip = this.config.afterZip || emptyFunc;
    }

    /**
     * [start zip file]
     */
    startZipFile() {
        this.readPluginConfig();

        this.addDestUrl();

        this.copyFiles();

        this.excludeFiles();

        this.replaceUrl();

        this.zipFiles();
    }

    /**
     * [add destUrl property to config map data]
     */
    addDestUrl() {

        let hasWebserver = false,
            webServerConfig = {};

        this.config.map.map((item) => {

            if (item.isWebserver) {
                hasWebserver = true;
                webServerConfig = item;
            }

        });

        this.config.map.map((item) => {

            item.destUrl = item.url;

            if (hasWebserver && item.isSameOrigin) {
                item.destUrl = webServerConfig.url || '';
            }
        });
    }

    /**
     * [copy files to offline folder]
     */
    copyFiles() {

        let beforeCopy = this.config.beforeCopy,
            afterCopy = this.config.afterCopy;

        beforeCopy.bind(this)();

        let cwd = process.cwd();

        fs.removeSync(path.join(cwd, this.config.zipFileName));
        fs.removeSync(path.join(cwd, this.config.zipFileName + '.zip'));

        this.config.map.forEach((item) => {
            let srcPath = path.join(this.config.src, item.src);

            let url = item.destUrl.replace('http://', '').replace('https://', '').replace('//', '').replace(':', '/'),
                dest = item.dest || '';

            let destPath = path.resolve(cwd, this.config.zipFileName, url, dest);

            try {
                fs.copySync(srcPath, destPath);
                // utils.info(destPath + " is copied success!");
            }
            catch (e) {
                this.error(e.stack);
            }
        });

        afterCopy.bind(this)();
    }

    /**
     * [remove exclude folder or files]
     */
    excludeFiles() {

        let cwd = process.cwd();

        this.config.map.forEach((item) => {

            let url = item.destUrl.replace('http://', '').replace('https://', '').replace('//', '').replace(':', '/'),
                dest = item.dest || '';

            let destPath = path.resolve(cwd, this.config.zipFileName, url, dest);

            if (!item.exclude || !item.exclude.length) {
                return;
            }

            // include folder itself
            let walkFiles = klawSync(destPath);
            walkFiles.unshift({ path: destPath });

            walkFiles.forEach((file) => {

                // loop through exclude files patterns
                item.exclude.forEach((match) => {
                    if (minimatch(file.path, match, {
                        matchBase: true,
                        dot: true
                    })) {
                        if (fs.existsSync(file.path)) {
                            fs.removeSync(file.path);
                        }
                    }
                });

            });
        });
    }

    /**
     * [replace cdn url with webserver url]
     */
    replaceUrl() {
        let hasWebserver = false,
            hasCdn = false,
            webserverDestUrl = null,
            webserverUrl = null,
            cdnDestUrl = null,
            cdnUrl = null;

        this.config.map.forEach((item) => {
            if (item.isWebserver) {
                hasWebserver = true;
                webserverDestUrl = item.destUrl;
                webserverUrl = item.url;
            }

            if (item.isSameOrigin) {
                hasCdn = true;
                cdnDestUrl = item.destUrl;
                cdnUrl = item.url;
            }
        });

        if (hasWebserver && hasCdn) {

            function walkAndReplace(config, folder, extname) {
                try {
                    let srcPath = path.join(config.zipFileName, folder);
                    srcPath = path.resolve(srcPath.replace(':', '/'));

                    let files = klawSync(srcPath);

                    files = files.filter((item) => {
                        return path.extname(item.path) === '.' + extname;
                    });

                    files.map((item) => {
                        let content = fs.readFileSync(item.path, 'utf-8');
                        content = content.replaceJsAll(cdnUrl, webserverUrl, extname);
                        fs.writeFileSync(item.path, content, 'utf-8');
                    });
                }
                catch (e) {
                    this.error(e.stack);
                }
            }

            walkAndReplace(this.config, cdnDestUrl.replaceAll('//', ''), 'js');
            walkAndReplace(this.config, webserverDestUrl.replaceAll('//', ''), 'html');
        }
    }

    iterateFiles(folderPath, cb) {
        let files = glob.sync(path.resolve(folderPath, '**/*'));

        files = files.filter((item) => {
            let fileInfo = fs.lstatSync(path.resolve(item));
            return fileInfo.isFile();
        });

        cb && cb.bind(this)(files);

        return files;
    }

    /**
     * [zip files]
     */
    zipFiles() {

        let beforeZip = this.config.beforeZip,
            afterZip = this.config.afterZip;

        // beforeZip();
        this.iterateFiles(this.config.zipFileName, beforeZip);

        let zipPath = path.resolve(this.config.zipFileName + '.zip');

        let output = fs.createWriteStream(zipPath);
        let archive = archiver('zip', this.config.zipConfig);

        output.on('close', () => {
            this.info('\nZip file total size: ' + Math.floor(archive.pointer() / 1024) + 'KB\n');
        });

        // good practice to catch this error explicitly
        archive.on('error', (err) => {
            this.error('error');
            throw err;
        });

        let zipFile = path.resolve(this.config.zipFileName);

        if (!fs.existsSync(zipFile)) {
            this.alert(zipFile + ' does not exists');
            return;
        }

        let zipFiles = klawSync(zipFile, { nodir: true });

        // archive.directory('offline/');

        zipFiles.forEach((item) => {
            archive.file(item.path, { name: path.relative(this.config.zipFileName, item.path) });
        });

        // pipe archive data to the file
        archive.pipe(output);

        archive.finalize();

        afterZip.bind(this)(`${zipFile}.zip`);

    }

    /* istanbul ignore next */
    /**
     * [help]
     */
    help() {
        this.printUsage('ak offline package', 'ak');
        this.printOption([
            {
                option: 'init',
                alias: 'i',
                description: 'initialize ak config'
            },
            {
                option: 'compress',
                alias: 'c',
                description: 'zip offline.zip'
            }
        ]);
    }
}

module.exports = AkPlugin;