var confus  = require('confus');
var lodash  = require('lodash');

var winston = require('winston');

module.exports = function(app) {

    // Setup our configuration object depending on NODE_ENV variable
    var config = confus({
        profiles: {
            development: [
                'etc/general',
                'etc/development'
            ]
        },
        root: __dirname + '/../../'
    });

/*    confus.at('production', function() {
        console.log('We are running in production build!');

        // In production mode print messages to winston
        const { createLogger, format, transports } = require('winston');

        var infoTransport = new (winston.transports.DailyRotateFile)({
            level: "info",
            dirname: "../logs",
            filename: 'info-%DATE%.log',
            datePattern: 'YYYY-MM',
            zippedArchive: false,
            maxSize: '20m',
            maxFiles: '14d'
        });
        var errorTransport = new (winston.transports.DailyRotateFile)({
            level: "error",
            dirname: "../logs",
            filename: 'error-%DATE%.log',
            datePattern: 'YYYY-MM',
            zippedArchive: false,
            maxSize: '20m',
            maxFiles: '14d'
        });

        winston.configure({
            transports: [
                infoTransport, errorTransport
            ]
        });
        winston.format.combine(
            winston.format.colorize(),
            winston.format.json()
        );
        app.settings.logger = winston;
    });
*/
    confus.at('development', function() {
        console.log('We are running in development build!');

        // In development mode print messages to stdout
        app.settings.logger = console;
    });

    lodash.merge(app.settings, config);
    //app.settings.logger.log("info", process.env);

};
