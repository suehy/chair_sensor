var Thingy = require('thingy52');
var keypress = require('keypress');
var publisher = require('../mqttClient/publisher')(options);
const EventEmitter = require('events');

const topic = 'sample';

var options = {
    // host: "health-iot.labs.vu.nl",
   host: "localhost",
    port: "1883"
}

const freq = 50;
var count = 0;
var idx = 0;
var sample = [[]];

keypress(process.stdin);
process.stdin.setRawMode(true);
process.stdin.resume();

class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

process.stdin.on('keypress', function (ch, key) {
    console.log('got "keypress"', key);
    if (key && key.ctrl && key.name == 'b') {
        // Pause sampling
        if (enabled) {
            enabled = false;
            myEmitter.emit('pause');
            console.log('pause');
        }
        else {
            enabled = true;
            myEmitter.emit('continue');
            console.log('continue');

        }
    }
    else if (key && key.ctrl && key.name == 'c') {
        console.log('CTRL + C');
        process.exit();
    }
});

function connectToBrokerSuccess() {
    console.log('Publisher connected to MQTT broker');
}

function onDiscover(thingy) {
    //TODO set static address
    console.log('Discovered: ' + thingy);

    thingy.on('disconnect', function() {
      console.log('Disconnected!');
    });

    myEmitter.on('pause', function() {
        thingy.raw_disable(function(error) {
            console.log('Raw sensor stopped! ' + ((error) ? error : ''));
        });
    });

    myEmitter.on('continue', function() {
        thingy.raw_enable(function(error) {
            console.log('Raw sensor started! ' + ((error) ? error : ''));
        });
    });

    thingy.connectAndSetUp(function(error) {
      console.log('Connected! ' + error ? error : '');
      console.log('Reading Thingy Motion sensors!');

      enabled = true;

      thingy.on('rawNotif', onRawData);
      // thingy.on('gravityNotif', onGravityData);
      // thingy.on('buttonNotif', onButtonChange);

      thingy.motion_processing_freq_set(50, function(error) {
          if (error) {
              console.log('Motion freq set configure failed! ' + error);
          }
      });

      // thingy.button_enable(function(error) {
      //     console.log('Button started! ' + ((error) ? error : ''));
      // });
      thingy.raw_enable(function(error) {
          console.log('Raw sensor started! ' + ((error) ? error : ''));
      });
    });
}

function onRawData(raw_data) {
    //console.log('Raw data: Accelerometer: x %d, y %d, z %d, state %d subject %s',
    //    raw_data.accelerometer.x, raw_data.accelerometer.y, raw_data.accelerometer.z, state, subject);

    if (count == 0) {
        row = [raw_data.accelerometer.x, raw_data.accelerometer.y, raw_data.accelerometer.z];
        sample.append(row);

        if (idx == freq-1) {
            // Publish sample
            publisher.publish(sample);
            myEmitter.emit('pause');
        }
        idx = (idx+1) % freq;
    }
}

publisher.connectToBroker('sue', options, connectToBrokerSuccess)
.then(() => {
    console.log('Started thingy discovery');
    Thingy.discover(onDiscover);
})
.catch((error) => {
    console.log('ERROR', error);
    publisher.end();
})
