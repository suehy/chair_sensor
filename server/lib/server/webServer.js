var http = require('http')

module.exports = function(app) {
//    var logger = app.settings.logger
    var serverConfig = app.settings.server;

    app.httpServer = http.createServer(app);
    app.httpServer.listen(serverConfig.port, function() {
        console.log('Server http listening on port ' + serverConfig.port + '.');
    });
}
