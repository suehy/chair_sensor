var mqtt = require('mqtt');
var client = mqtt.connect('mqtt:localhost:1883', {clientId: 'subscriber'});

client.on('connect', function () {
    client.subscribe('presence', function (err) {
        if (!err) {
            client.on('message', function (topic, message) {
                // message is Buffer
                console.log(message.toString())
                client.end()
            });
        }
    })
})
