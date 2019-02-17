var mqtt = require('mqtt');
var client = mqtt.connect('mqtt:localhost:1883', {clientId: 'publisher'});

var rawAccelData = {
    x: 1, y: 2, z: 3
}

client.on('connect', function () {
    client.publish('rawAccelData', JSON.stringify(rawAccelData));
})
