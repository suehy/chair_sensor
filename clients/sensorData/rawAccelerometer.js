//var Thingy = require('thingy52');
//require('console.table');
var enabled;

var options = {
    host: "localhost",
    port: "1883"
}

function connectToBrokerSuccess() {
    console.log('Publisher connected to MQTT broker');
}

var publisher = require('../mqttClient/publisher')(options);

// Start connecting to Nordic Thingy and collecting data iff connection with broker is successful
publisher.connectToBroker(options, connectToBrokerSuccess)
.then(() => {
    console.log('in the then');
    publisher.publish();
})
.catch((error) => {
    console.log(error);
})
//console.log('Reading Thingy raw accelerometer data');
