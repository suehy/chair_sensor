var mongoose = require('mongoose');

Model = function Model(app) {
    this.app = app;
    this.logger = app.settings.logger;
    this.mongoose = null;
}
var self;

Model.prototype.Predict = function(data) {
    // Given sample predicts and return current state
}

module.exports = function(app) {
    self = new Model(app);
    app.components.Model = self;
}
