var net = require('net');
var mqttCon = require('mqtt-connection');
var server = new net.Server();

module.exports = function(app) {
    var logger = app.settings.logger

    server.on('connection', function(stream) {
        logger.log('MQTT broker: onConnection');
        var client = mqttCon(stream)

        // client connected
        client.on('connect', function (packet) {
            logger.log('MQTT broker: client connected');
            // acknowledge the connect packet
            client.connack({ returnCode: 0 });
        })

        // client published
        client.on('publish', function (packet) {
            logger.log('MQTT broker: client published', packet);
            // send a puback with messageId (for QoS > 0)
            client.puback({ messageId: packet.messageId })
        })

        // client pinged
        client.on('pingreq', function () {
            logger.log('MQTT broker: client pinged');
            // send a pingresp
            client.pingresp()
        });

        // client subscribed
        client.on('subscribe', function (packet) {
            logger.log('MQTT broker: client subscribed');
            // send a suback with messageId and granted QoS level
            client.suback({ granted: [packet.qos], messageId: packet.messageId })
        })

        // timeout idle streams after 5 minutes
        stream.setTimeout(1000 * 60 * 5)

        // connection error handling
        client.on('close', function () { client.destroy() })
        client.on('error', function () { client.destroy() })
        client.on('disconnect', function () { client.destroy() })

        // stream timeout
        stream.on('timeout', function () { client.destroy(); })
    })

    // listen on port 1883
    server.listen(1883)
}
