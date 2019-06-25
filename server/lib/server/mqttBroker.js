var mosca = require('mosca');

function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}

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
        // logger.log('Published', packet);

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

        else if (packet.topic == 'sample') {
            logger.log('info', 'published to topic sample', packet, client.id);

            // Predict state and then saves prediction
            // Expects sample to have appropiate shape
            // const sample = JSON.parse(packet.payload).sample;
            var sample = JSON.parse(packet.payload);
            var prediction = {
                // name: JSON.parse(packet.payload).name,
                name: "test",
                prediction: {
                    state: null
                }
            }
            logger.log(sample);
            app.components.Model.Predict(sample)
            .then((probs) => {
                logger.log(probs)
                logger.log('STATE:', indexOfMax(probs));
                prediction.prediction.state = indexOfMax(probs);
                return app.components.DataManagement.addPrediction(prediction);
            })
            .then(() => {
                var sampleObj = {
                    name: "test",
                    state: prediction.prediction.state,
                    sample: sample
                }
                return app.components.DataManagement.addSample(sampleObj);
            })
            .then(() => {
                return app.components.DataManagement.getLatestState({name: "test"});
            })
            .then((state) => {
                var packet = {
                    topic: 'dashboard',
                    payload: JSON.stringify(state)
                }
                server.publish(packet, function() {
                    logger.log('Packet sent to', packet.topic);
                })
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
