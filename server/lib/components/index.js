module.exports = function(app) {
    app.components = {};
    require('./DatabaseDriver')(app);
    require('./SensorDataManagement')(app);
}
