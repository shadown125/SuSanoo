module.exports = {
    plugins:
        process.env.NODE_ENV === 'production'
            ? {
                autoprefixer: {},
                'postcss-csso': {
                    restructure: false
                }
            }
            : {
                autoprefixer: {}
            }
}
