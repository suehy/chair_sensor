var mongoose = require('mongoose');
const tf = require('@tensorflow/tfjs');
const tfnode = require('@tensorflow/tfjs-node');

Model = function Model(app) {
    this.app = app;
    this.logger = app.settings.logger;
    this.mongoose = null;

    //TODO use await
    // Read saved model from file here
    tf.loadLayersModel('file://lib/components/ChairModel/model.json')
    .then((model) => {
        this.model = model;
        // var example = [];
        // var i = 0;
        // while (i < 50) {
        //     example[i] = [1,0,-0.5];
        //     i += 1;
        // }
        // example = tf.tensor([example]);
        // const pred = model.predict(example).print();
    })
    // Error caught by caller
}
var self;

Model.prototype.Predict = function(params) {
    // Given sample predicts and return new state as a Promise
    return Promise.resolve(self.model.predict(params));
}

module.exports = function(app) {
    self = new Model(app);
    app.components.Model = self;
}
