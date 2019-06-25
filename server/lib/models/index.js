module.exports = function(app) {
    app.models = {};
    require('./RawAccelerometerData')(app);
    require('./Sample')(app);
    require('./Predictions')(app);
}
