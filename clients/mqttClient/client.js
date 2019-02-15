var net = require('net')
var mqttCon = require('mqtt-connection')
var stream = net.createConnection(1883, 'localhost')
var conn = mqttCon(stream)

// conn is your MQTT connection!

console.log('client hey');
