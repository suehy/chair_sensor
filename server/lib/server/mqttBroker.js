var mosca = require('mosca');

module.exports = function(app) {
    var logger = app.settings.logger;

    var ascoltatore = {
      //using ascoltatore
      type: app.settings.mqttBroker.type,
      url: app.settings.mqttBroker.hostName + ":" + app.settings.mqttBroker.dbPort + "/mqtt",
      pubsubCollection: app.settings.mqttBroker.pubsubCollection,
      mongo: {}
    };

    var settings = {
      port: app.settings.mqttBroker.port,
      backend: ascoltatore
    };

    var server = new mosca.Server(settings);

    server.on('ready', setup);

    server.on('clientConnected', function(client) {
        logger.log('client connected', client.id);
    });

    // fired when a message is received
    server.on('published', function(packet, client) {
        logger.log('Published', packet);

        if (packet.topic === 'rawAccelData') {
            logger.log('info', 'published to topic rawAccelData');

            // Store raw accelerometer data in DB
            app.components.RawAccelerometerDataManagement.InsertRawAccelerometerData(JSON.parse(packet.payload))
            .then((data) => {
                logger.log("info", "RawAccelerometerData insert success");
            })
            .catch((error) => {
                logger.log("error", error);
            });
        }
    });

    server.on('clientDisconnected', function(client) {
        logger.log('clientDisconnected', client.id);
    });

    server.on('subscribed', function(topic, client) {
        logger.log('Subscribed', client.id);
    });

    // fired when the mqtt server is ready
    function setup() {
        logger.log('Mosca server is up and running');
    }
};
