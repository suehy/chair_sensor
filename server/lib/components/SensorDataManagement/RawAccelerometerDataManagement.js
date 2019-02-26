var mongoose = require("mongoose");

var self;

function RawAccelerometerDataManagement(app) {
    this.app = app; // A handle to express
    this.components = app.components; // A handle to the components exported by other modules
    this.RawAccelerometerDataModel = app.models.RawAccelerometerData;
    this.utils = app.utils;
    this.logger = app.settings.logger; // Project logging facilities
    this.errorHandling = app.utils.errorHandling;
}

function insertRawAccelerometerData(params) {
    self.logger.log("info", "in insertRawAccelerometerData");

    if (!params) {
        return Promise.reject("params is null");
    }
    // Extract raw accelerometer data out of params
    //TODO: should validate this
    let dataObj = {
        subject: params.subject,
        state: params.state,
        x: params.x,
        y: params.y,
        z: params.z
    }

    return Promise.resolve((new self.RawAccelerometerDataModel).addRawData(dataObj));
}

function getRawAccelerometerData(params) {
    self.logger.log("info", "in getRawAccelerometerData");
    return Promise.resolve((new self.RawAccelerometerDataModel).getRawData(params));
}

RawAccelerometerDataManagement.prototype.InsertRawAccelerometerData = function(params) {
    return insertRawAccelerometerData(params)
}

RawAccelerometerDataManagement.prototype.GetRawAccelerometerData = function(params) {
    return getRawAccelerometerData(params)
}

module.exports = function(app) {
    self = new RawAccelerometerDataManagement(app);
    app.components.RawAccelerometerDataManagement = self;
}
