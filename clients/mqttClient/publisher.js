var mqtt = require('mqtt');

var self, client, options;

Publisher = function Publisher(options) {
    this.options = options;
};

Publisher.prototype.connectToBroker = function(options, successCb) {
    console.log('Connecting to MQTT broker...');

    var broker = "mqtt:" + options.host + ";" + options.port;
    var client = mqtt.connect(broker, {clientId: options.publisher ? options.publisher : "publisher"});

    return new Promise((resolve, reject) => {

        client.on('connect', () => {
            this.client = client;
            resolve(successCb());
        });

        client.on('error', (error) => {
            reject(error);
        });
    });
}

Publisher.prototype.publish = function(msg, options) {
    var rawAccelData = {
        x: 9999, y: 2, z: 3
    };

    self.client.publish('rawAccelData', JSON.stringify(rawAccelData));
}

module.exports = function(options) {
    self = new Publisher(options);
    return self;
}
