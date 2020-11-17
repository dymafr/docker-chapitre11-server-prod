module.exports = [
    {
        script: 'src/index.js',
        name: 'api',
        exec_mode: 'cluster',
        instances: 'max'
    }
]