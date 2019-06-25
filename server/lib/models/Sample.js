var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var errorHandling;
var logger;

const STATES = {
    "NOTSITTING": 0,
    "SITTING": 1,
    "SITTOSTAND": 2,
    "STANDTOSIT": 3
}

const Sample = new Schema({
    timestamp: {
        type: Date,
        default: Date.now
    },
    name: {
        type: String,
        required: true
    },
    sample: {
        type: [[Number]],
        required: true
    }
    // x: {
    //     type: [[Number]],
    //     required: true
    // },
    // y: {
    //     type: [[Number]],
    //     required: true
    // },
    // z: {
    //     type: [[Number]],
    //     required: true
    // }
})

Sample.methods.addSample = function(sample) {
    logger.log("info", "in SampleModel addSample");
    var SampleModel = mongoose.model('Sample');
    return new SampleModel(sample).save();
}

module.exports = function(app) {
    app.models.Sample = mongoose.model('Sample', Sample);
    errorHandling = app.utils.errorHandling;
    logger = app.settings.logger;
}
