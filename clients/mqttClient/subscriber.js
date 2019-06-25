var mqtt = require('mqtt');

var self, client;

Subscriber = function Subscriber(options) {
    this.options = options;
};

Subscriber.prototype.connectToBroker = function(clientId, options, successCb) {
    console.log(clientId + ' connecting to MQTT ' + broker);

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

Subscriber.prototype.subscribe = function(topic, options, cb) {
    return new Promise((resolve, reject) => {
        self.client.subscribe(topic, (err) => {
            if (!err) {
                self.client.on('message', (topic, msg) => {
                    console.log(msg.toString());
                });
                resolve('success');
            }
            else {
                reject(err);
            }
        });
    });
}

Subscriber.prototype.end = function() {
    self.client.end();
}

module.exports = function(options) {
    self = new Subscriber(options);
    return self;
}
