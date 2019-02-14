module.exports = function(app) {
    app.models = {};
    require('./RawAccelerometerData')(app);
}
