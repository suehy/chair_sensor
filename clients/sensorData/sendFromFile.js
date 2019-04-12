const fs = require('fs')

var options = {
    host: "health-iot.labs.vu.nl",
    port: "1883"
}

function connectToBrokerSuccess() {
    console.log('Publisher connected to MQTT broker');
}

var publisher = require('../mqttClient/publisher')(options);

publisher.connectToBroker(options, connectToBrokerSuccess)
.then(() => {
    if (!!!process.argv[2]) {
        console.log('Exit: No source given')
        publisher.end()
        process.exit()
    }
    filePath = process.argv[2]
    console.log("Sending data from source %s to server", filePath)

    fs.readFile(filePath, 'utf8', (err, jsonString) => {
        if (err) {
            console.log("Error reading file from disk:", err)
            return
        }
        try {
            const data_dict = JSON.parse(jsonString)
            for (var key in data_dict) {
                console.log(key)
                var data = data_dict[key]
                console.log(data.length);
                for (var i = 100000; i < 111377; i++) {
                    var sample = data[i]
                    var msg = { x: sample['x'],
                                y: sample['y'],
                                z: sample['z'],
                                state: sample['state'],
                                subject: key,
                                timestamp: sample['timestamp']
                    }
                    publisher.publish(msg);
                 }
            }

            // data.forEach(sample => {
            //     console.log(sample['x'])
            // });
            publisher.end()
    } catch(err) {
            console.log('Error parsing JSON string:', err)
        }
    })
})
.catch((error) => {
    console.log('ERROR', error);
    publisher.end();
})
