var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var errorHandling;
var logger;

const STATES = {
    "NOTSITTING": 0,
    "SITTING": 1,
    "STANDINGUP": 2,
    "SITTINGDOWN": 3
}

const RawAccelerometerData = new Schema({
        timestamp: {
            type: Date,
            default: Date.now
        },
        state: {
            type: String
        },
        subject: {
            type: String
        },
        x: {
            type: Number,
            required: true
        },
        y: {
            type: Number,
            required: true
        },
        z: {
            type: Number,
            required: true
        }
    }
);

RawAccelerometerData.methods.addRawData = function(params) {
    logger.log("info", "In RawAccelerometerData addRawData", params);
    var RawAccelerometerDataModel = mongoose.model('RawAccelerometerData');
    return new RawAccelerometerDataModel(params).save();
}

module.exports = function(app) {
    app.models.RawAccelerometerData = mongoose.model('RawAccelerometerData', RawAccelerometerData);
    //app.models.RawAccelerometerData.states = STATES;

    errorHandling = app.utils.errorHandling;
    logger = app.settings.logger;
}
