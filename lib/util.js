const path = require('path');
const fs = require('fs');
const config = require('./config');

let util = {};

util.log = {
    log: console.log.bind(console),

    warn: console.warn.bind(console),

    debug: function() {
        if(!config.debug) {
            return;
        }
        console.debug.apply(this, arguments);
    },

    error: console.error.bind(console),

    fatal: function() {
        console.error.apply(this, arguments);
        process.exit(1);
    }
};

util.readFile = function(file) {
    let content;
    try {
        content = fs.readFileSync(file);    
    } catch(e) {
        util.log.error(e);
    }   

    return content || '';
};

util.writeFile = function(path, filename, file) {
    if(!filename) {
        filename = path;
    } else {
        filename = path.join(path, filename);
    }

    let content;
    try {
        content = fs.writeFileSync(filename, file);    
    } catch(e) {
        util.log.error(e);
    }   

    return content || '';
};

util.genFileName = function(file, ext) {
    let filename = file = path.win32.basename(file);
    let fileExt = path.extname(file);
    let newName = config.name[ext];

    if(!ext) {
        util.log.error('can\'t find ext name ', file, newName);
    }

    return (newName || '').replace('[name]', filename.replace(fileExt || '', ''));
}

module.exports = util;
