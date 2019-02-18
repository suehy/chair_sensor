var Thingy = require('thingy52');

var enabled;

var options = {
    host: "localhost",
    port: "1883"
}

function connectToBrokerSuccess() {
    console.log('Publisher connected to MQTT broker');
}

function onGravityData(gravity) {
    console.log('Gravity: x: %d, y %d, z %d', gravity.x, gravity.y, gravity.z);
}

function onRawData(raw_data) {
    console.log('Raw data: Accelerometer: x %d, y %d, z %d',
        raw_data.accelerometer.x, raw_data.accelerometer.y, raw_data.accelerometer.z);
    // console.log('Raw data: Gyroscope: x %d, y %d, z %d',
    //     raw_data.gyroscope.x, raw_data.gyroscope.y, raw_data.gyroscope.z);
    // console.log('Raw data: Compass: x %d, y %d, z %d',
    //     raw_data.compass.x, raw_data.compass.y, raw_data.compass.z);
    var msg = { x: raw_data.accelerometer.x, y: raw_data.accelerometer.y, z: raw_data.accelerometer.z };
    publisher.publish(msg);
}

function onButtonChange(state) {
    if (state == 'Pressed') {
        if (enabled) {
            enabled = false;
            this.raw_disable(function(error) {
                console.log('Raw sensor stopped! ' + ((error) ? error : ''));
            });
            // this.gravity_disable(function(error) {
            //     console.log('Gravity sensor stopped! ' + ((error) ? error : ''));
            // });
        }
        else {
            enabled = true;
            this.raw_enable(function(error) {
                console.log('Raw sensor started! ' + ((error) ? error : ''));
            });
            // this.gravity_enable(function(error) {
            //     console.log('Gravity sensor started! ' + ((error) ? error : ''));
            // });
        }
    }
}

function onDiscover(thingy) {
    //TODO set static address
    console.log('Discovered: ' + thingy);

    thingy.on('disconnect', function() {
      console.log('Disconnected!');
    });

    thingy.connectAndSetUp(function(error) {
      console.log('Connected! ' + error ? error : '');
      console.log('Reading Thingy Motion sensors!');

      thingy.on('rawNotif', onRawData);
      thingy.on('gravityNotif', onGravityData);
      thingy.on('buttonNotif', onButtonChange);

      thingy.motion_processing_freq_set(5, function(error) {
          if (error) {
              console.log('Motion freq set configure failed! ' + error);
          }
      });

      enabled = true;

      thingy.button_enable(function(error) {
          console.log('Button started! ' + ((error) ? error : ''));
      });
      this.raw_enable(function(error) {
          console.log('Raw sensor started! ' + ((error) ? error : ''));
      });
      // this.gravity_enable(function(error) {
      //     console.log('Gravity sensor started! ' + ((error) ? error : ''));
      // });
    });
}

var publisher = require('../mqttClient/publisher')(options);

// Start connecting to Nordic Thingy and collecting data iff connection with broker is successful
//TODO set reconnect and retries in options
publisher.connectToBroker(options, connectToBrokerSuccess)
.then(() => {
    console.log('Started thingy discovery');
    Thingy.discover(onDiscover);

    //TODO implement stop and start and label event emitter and handler
})
.catch((error) => {
    console.log('ERROR', error);
    publisher.end();
})
//console.log('Reading Thingy raw accelerometer data');
