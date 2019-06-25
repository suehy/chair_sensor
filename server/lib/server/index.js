module.exports = function(app) {
    // var mqttBrokerConfig = app.settings.mqqtBroker;
//    var logger = app.settings.logger;

    require('./webServer')(app);
    require('./mqttBroker')(app);
}
