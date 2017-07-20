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

    let filename = path.win32.basename(options.filePath);
    let filenames = {};
    let data = parse({
        file: options.file
    });

    Object.keys(data).forEach(function(type) {
        filenames[type] = util.genFileName(filename, type);
    });

    if(!data.js) {
        util.log.fatal('can not find script in ', options.filePath);
    }
    
    if(data.css) {
        let code = '    require(\'./' + filenames.css+ '\');'
        if(options.raw) {
            data.js = data.js.replace(/(<script[^>]*>\*?\/?)/, '$1\n' + code); 
        } else {
            data.js = code + '\n' + data.js;
        }
        
    }

    if(data.template) {
        if(!/template:\s*\'\'/.test(data.js)) {
            util.log.error('cant not finld template prop in ', options.filePath);
        }
        data.js = data.js.replace(/template:\s*\'\'/, `template: require('./${filenames.template}')`);
    }

    return {
        filenames: filenames,
        data: data
    };
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
        raw: config.raw
    }, options || {});

    let file = options.file;
    let data = {};
    let parser = {
        template: {
            start: /^\s*<template[^>]*>/i,
            end: '</template>',
        },
        js: {
            start: /^\s*<script[^>]*>/i,
            end: '</script>',
        },
        css: {
            start: /^\s*<style[^>]*>/i,
            end: '</style>',
        }
    };

    let order = [];
    let types = Object.keys(parser);
    types.forEach(function(type) {
        let item = parser[type];
        let index = file.indexOf(item.end);
        if(index < 0) {
            return;
        }

        order.push({
            index: index,
            type: type,
            item: item
        });
    });

    order.sort(function(a, b) {
        return a.index - b.index;
    });

    content = file;
    order.forEach(function(info) {
        let item = info.item;
        content = content.split(item.end);
        if(content.length > 1) {
            data[info.type] = content[0].replace(item.start, '');
            content = content[1];
        }
    });

    if(options.raw) {
        file = '/*' + file + '*/';
        file = file
            .replace(/(<script[^>]*>)/, '$1*/') 
            .replace(parser.js.end, '/*' + parser.js.end);
        data.js = file;
    }

    return data;
}

function gen(options) {
    options = Object.assign({
        filePath: './test/src/index.vue',
        file: '',
        dest: './test/dest/',
        removeOriFile: true
    }, options || {});

    if(!options.dest) {
        options.dest = path.dirname(options.filePath);
    }

    if(!options.file) {
        options.file = util.readFile(options.filePath).toString();
    }

    let info = compile(options);

    Object.keys(info.data).forEach(function(type) {
        if(!info.data[type]) {
            return;
        }

        let destFile = path.join(options.dest, info.filenames[type]);
        util.writeFile(destFile, null, info.data[type]);
    });
}

//parse();
gen();