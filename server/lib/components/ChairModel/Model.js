var mongoose = require('mongoose');

Model = function Model(app) {
    this.app = app;
    this.logger = app.settings.logger;
    this.mongoose = null;

    // Read saved model from file here
}
var self;

Model.prototype.Predict = function(params) {
    // Given sample predicts and return current state
    var state = 3;
    return new Promise((resolve, reject) => {
        resolve(state);
    });
}

module.exports = function(app) {
    self = new Model(app);
    app.components.Model = self;
}
