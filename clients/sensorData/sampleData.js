var Thingy = require('thingy52');
var keypress = require('keypress');
var publisher = require('../mqttClient/publisher')(options);
var subscriber = require('../mqttClient/subscriber')(options);
const EventEmitter = require('events');

const topic = 'sample';


const STATES = {
    "NOTSITTING": 0,
    "SITTING": 1,
    "SITTOSTAND": 2,
    "STANDTOSIT": 3
}

var options = {
    // host: "health-iot.labs.vu.nl",
//   host: "localhost",
    host: "192.168.200.1",
    port: "1883"
}

var subject = process.argv.length >= 3 ? process.argv[2] : "";
var enabled;
var state = process.argv.length >= 4 ? parseInt(process.argv[3]) : STATES.SITTING;

const freq = 50;
const overlap = 40;
var count = 0;
var idx = 0;
var sample = [];

keypress(process.stdin);
process.stdin.setRawMode(true);
process.stdin.resume();

class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

process.stdin.on('keypress', function (ch, key) {
    console.log('got "keypress"', key);
    if (key && key.name == 's') { // sitting
        state = STATES.SITTING;
        console.log('STATE == sittng');
    }
    else if (key && key.name == 'n') { // not sitting
        state = STATES.NOTSITTING;
        console.log('STATE == not sittng');
    }
    else if (key && key.name == 'i') { // sit-to-stand
        state = STATES.SITTOSTAND;
        console.log('STATE == sit-to-stand');
    }
    else if (key && key.name == 't') { // stand-to-sit
        state = STATES.STANDTOSIT;
        console.log('STATE == stand-to-sit');
    }
    else if (key && key.ctrl && key.name == 'b') {
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

      thingy.motion_processing_freq_set(freq, function(error) {
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
//    console.log('Raw data: Accelerometer: x %d, y %d, z %d', raw_data.accelerometer.x, raw_data.accelerometer.y, raw_data.accelerometer.z);

    var msg = { x: raw_data.accelerometer.x, y: raw_data.accelerometer.y, z: raw_data.accelerometer.z, state: state, subject: subject };
//    publisher.publish(msg, 'rawAccelData');

    console.log(count);
    if (count < 1000) {
        row = [raw_data.accelerometer.x, raw_data.accelerometer.y, raw_data.accelerometer.z];
        sample.push(row);

        // if (idx == freq-1) {
        if (idx == freq) {
            console.log('idx in the if', idx);
            // Publish sample
            publisher.publish(sample, topic);
    	    count += 1;
            // create overlapping windows
            sample.splice(0,(freq-overlap));
        }
        // idx = (idx+1) % freq;
        idx = sample.length;
        console.log('idx', idx);
    }
    else if (count == 1000) {
        myEmitter.emit('pause');
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

//subscriber.connectToBroker('sue', options, connectToBrokerSuccess)
//.then(() => {
//    subscriber.subscribe('ctrl');
//})
//.catch((err) => {
//    console.log('ERROR', err);
//    subscriber.end();
//});
