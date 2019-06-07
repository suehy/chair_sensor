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
      backend: ascoltatore,
      http: {
        port: 8080,
        bundle: true,
        static: './'
      }
    };

    var server = new mosca.Server(settings);

    server.on('ready', setup);

    server.on('clientConnected', function(client) {
        logger.log('client connected', client.id);

        // Check if client has permission
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

        if (packet.topic === 'sample') {
            logger.log('info', 'published to topic sample', packet, client.id);
            logger.log('info', 'payload', JSON.parse(packet.payload));
            // Predict state and then saves prediction
            const sample = JSON.parse(packet.payload).sample;
            app.components.Model.Predict(sample)
            .then((state) => {
                const prediction = {
                    name: JSON.parse(packet.payload).name,
                    prediction: {
                        state: state
                    }
                }
                return app.components.DataManagement.addPrediction(prediction);
            })
            .catch((err) => {
                logger.log("ERROR", err);
            })
        }
    });

    server.on('clientDisconnected', function(client) {
        logger.log('clientDisconnected', client.id);
    });

    server.on('subscribed', function(topic, client) {
        logger.log('Subscribed', client.id, topic);

        // Check if client has permission

    });

    // fired when the mqtt server is ready
    function setup() {
        logger.log('Mosca server is up and running on port', settings.port);
    }
};
