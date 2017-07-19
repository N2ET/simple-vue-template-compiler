module.exports = (function() {
    return {
        debug: process.env.debug,
        raw: false,
        name: {
            js: '[name].js',
            template: '[name].vue.tpl',
            css: '[name].vue.css'
        }
    };
}());