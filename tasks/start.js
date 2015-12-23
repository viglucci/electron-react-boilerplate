'use strict';

var Q = require('q');
var electron = require('electron-prebuilt');
var pathUtil = require('path');
var childProcess = require('child_process');
var kill = require('tree-kill');
var utils = require('./utils');
var gutil = require("gulp-util");

var jetpack = require('fs-jetpack');
var projectDir = jetpack;
var configDir = projectDir.cwd('./config');

var webpack = require("webpack");
var WebpackDevServer = require("webpack-dev-server");
var webpackConfig = require(configDir.path('webpack.config.js'));

var watch;

var gulpPath = pathUtil.resolve('./node_modules/.bin/gulp');
if (process.platform === 'win32') {
    gulpPath += '.cmd';
}

var runBuild = function () {
    var deferred = Q.defer();

    var build = childProcess.spawn(gulpPath, [
        'build',
        '--env=' + utils.getEnvName(),
        '--color'
    ], {
        stdio: 'inherit'
    });

    build.on('close', function (code) {
        deferred.resolve();
    });

    return deferred.promise;
};

var runwebpackDevServer = function () {
    var deferred = Q.defer();

    // modify some webpack config options
    var myConfig = Object.create(webpackConfig);
    myConfig.devtool = "eval";
    myConfig.debug = true;

    // Start a webpack-dev-server
    new WebpackDevServer(webpack(myConfig), {
        publicPath: "/" + myConfig.output.publicPath,
        stats: {
            colors: true
        }
    }).listen(8080, "localhost", function(err) {
        if(err) throw new gutil.PluginError("webpack-dev-server", err);
        gutil.log("[webpack-dev-server]", "http://localhost:8080/webpack-dev-server/index.html");
        deferred.resolve();
    });

    return deferred.promise;
};

var runGulpWatch = function () {
    watch = childProcess.spawn(gulpPath, [
        'watch',
        '--env=' + utils.getEnvName(),
        '--color'
    ], {
        stdio: 'inherit'
    });

    watch.on('close', function (code) {
        // Gulp watch exits when error occured during build.
        // Just respawn it then.
        runGulpWatch();
    });
};

var runApp = function () {
    var app = childProcess.spawn(electron, ['./build'], {
        stdio: 'inherit'
    });

    app.on('close', function (code) {
        // User closed the app. Kill the host process.
        kill(watch.pid, 'SIGKILL', function () {
            process.exit();
        });
    });
};

runBuild()
    .then(runwebpackDevServer())
    .then(function () {
        runGulpWatch();
        runApp();
    });
