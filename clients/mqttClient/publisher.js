var mqtt = require('mqtt');

var self, client, options;

Publisher = function Publisher(options) {
    this.options = options;
};

// Publisher.prototype.connectToBroker = function(options, successCb) {
//     console.log('Connecting to MQTT broker...');
//
//     var broker = "mqtt:" + options.host + ";" + options.port;
//     var client = mqtt.connect(broker, {clientId: options.publisher ? options.publisher : "publisher"});
//
//     return new Promise((resolve, reject) => {
//
//         client.on('connect', () => {
//             this.client = client;
//             resolve(successCb());
//         });
//
//         client.on('error', (error) => {
//             reject(error);
//         });
//     });
// }

Publisher.prototype.connectToBroker = function(clientId, options, successCb) {
    console.log('Connecting to MQTT broker...');

    var broker = "mqtt:" + options.host + ";" + options.port;
    var client = mqtt.connect(broker, {clientId: clientId});

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

// Publisher.prototype.publish = function(msg, options, cb) {
//     return new Promise((resolve, reject) => {
//         self.client.publish('rawAccelData', JSON.stringify(msg), options, (err) => {
//             if (err) {
//                 reject(err);
//             }
//             resolve('success');
//         });
//     });
// }

Publisher.prototype.publish = function(msg, topic, options, cb) {
    return new Promise((resolve, reject) => {
        self.client.publish(topic, JSON.stringify(msg), options, (err) => {
            if (err) {
                reject(err);
            }
            resolve('success');
        });
    });
}

Publisher.prototype.end = function() {
    self.client.end();
}

module.exports = function(options) {
    self = new Publisher(options);
    return self;
}
