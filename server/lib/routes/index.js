module.exports = function(app) {
    var routingConfig = app.settings.routes;
    var logger = app.settings.logger;

    app.use("/" + routingConfig.apiservice.baseUrl, require('./api')(app));
    app.use("/dashboard", require('./dashboardDemo')(app));
}
