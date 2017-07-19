const path = require('path');
const config = require('./config');
const util = require('./util');

/**
 * 
 * @param {*} options 
 * @param options.file
 * @param options.filePath
 * @param options.raw
 */
function compile(options) {
    options = Object.assign({
        file: '',
        filePath: '',
        raw: config.raw
    }, options || {});

    if(options.filePath) {
        options.file = util.readFile(options.filePath).toString();
    }

    return options.file && parse({
        file: options.file
    });
}

/**
 * 
 * @param options
 * @param options.file
 * @param options.raw
 */
function parse(options) {
    options = Object.assign({
        file: '',
        raw: true || config.raw
    }, options || {});

    let file = options.file;
    let data = {};

    let content = file.replace(/(^\s*|\s*$)/, '').split('</template>');
    if(content.length > 1) {
        data.template = content[0].replace(/(^\s*|\s*$)/, '').replace(/^<template[^>]*>/i, '');
        content = content[1].replace(/(^\s*|\s*$)/, '');
    }

    content = content.split('</script>');
    if(content.length > 1) {
        data.js = content[0].replace(/^<script[^>]*>/i, '');
        content = content[1].replace(/(^\s*|\s*$)/, '');
    }

    content = content.split('</style>');
    if(content.length > 1) {
        data.css = content[0].replace(/^<style[^>]*>/i, '');
    }

    if(options.raw) {
        file = '/*' + file + '*/';
        file = file
            .replace(/(<script[^>]*>)/, '$1*/') 
            .replace('</script>', '/*<script>');
        data.js = file;
    }

    return data;
}

function gen(options) {
    options = Object.assign({
        filePath: './test/src/index.vue',
        dest: './test/dest/',
        removeOriFile: true
    }, options || {});

    let vue = compile(options);
    let filename = path.win32.basename(options.filePath);

    if(!options.dest) {
        options.dest = path.dirname(options.filePath);
    }

    Object.keys(vue).forEach(function(type) {
        if(!vue[type]) {
            return;
        }

        let destFile = path.join(options.dest, util.genFileName(filename, type));
        util.writeFile(destFile, null, vue[type]);
    });
}

//parse();
gen();