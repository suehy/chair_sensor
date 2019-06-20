// Handles storing new samples and updating states of each user
var mongoose = require('mongoose');

DataManagement = function DataManagement(app) {
    this.app = app;
    this.logger = app.settings.logger;
    this.PredictionsModel = app.models.Predictions;
    this.SampleModel = app.models.Sample;
}
var self;

DataManagement.prototype.addPrediction = function(params) {
    self.logger.log("info", "DataManagement addPrediction", params);
    return (new self.PredictionsModel).addPrediction(params);
}

DataManagement.prototype.getLatestState = function(id) {
    self.logger.log("info", "DataManagement getLatestState", id);
    return (new self.PredictionsModel).getLatestState(id);
}

DataManagement.prototype.addSample = function(params) {
    self.logger.log("info", "DataManagement addSample", params);
    if (!params) {
        return Promise.reject("params is null");
    }
    return (new self.SampleModel).addSample(params);
}

module.exports = function(app) {
    self = new DataManagement(app);
    app.components.DataManagement = self;
}

// model to retrain and predict
// component managing storing and updating samples and predictions
// listener to wait for new predictions and update connected users (mqtt subscriber)
//
//
// a client both publish and subscribe to different mqtt topics
