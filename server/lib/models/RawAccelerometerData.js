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
            type: Number
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
    logger.log("info", "In RawAccelerometerDataModel addRawData", params);
    var RawAccelerometerDataModel = mongoose.model('RawAccelerometerData');
    return new RawAccelerometerDataModel(params).save();
}

RawAccelerometerData.methods.getRawData = function(params) {
    logger.log("info", "In RawAccelerometerDataModel getRawData", params);
    return this.model('RawAccelerometerData').find(params).exec()
    .catch((err) => {
        logger.log("error", err);
        return Promise.reject("Error getting raw accelerometer data");
    });
}

module.exports = function(app) {
    app.models.RawAccelerometerData = mongoose.model('RawAccelerometerData', RawAccelerometerData);
    //app.models.RawAccelerometerData.states = STATES;

    errorHandling = app.utils.errorHandling;
    logger = app.settings.logger;
}
