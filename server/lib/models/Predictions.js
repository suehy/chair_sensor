var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var errorHandling;
var logger;

const strict = {strict: "throw"};

const STATES = {
    "NOTSITTING": 0,
    "SITTING": 1,
    "SITTOSTAND": 2,
    "STANDTOSIT": 3
}
// const UserCycles = new Schema({
const Predictions = new Schema({
    lastUpdated: {
        type: Date,
        // required: true,
        // default: Date.now
    },
    name: {
        type: String,
        required: true
    },
    predictions: [{
        type: [ObjectId], ref: 'PredictionHistory'
        // required: true
    }],
    cycles: [{
        type: [ObjectId], ref: 'Cycle'
    }],
    latestState: {
        type: Number,
        required: true
    }
})//, strict)

const Cycle = new Schema({
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date
    }
    // userId: {
    //     type: String
    // }
})//, strict)

const PredictionHistory = new Schema({
    timestamp: {
        type: Date
//        default: Date.now,
        // required: true
    },
    state: {
        type: Number,
        required: true
    }
})//, strict)

// Also updates the latestState
Predictions.methods.addPrediction = function(params) {
    logger.log("info", "In Predictions addPrediction", params);
    return new Promise((resolve, reject) => {
        this.model('Predictions').findOne({'name': params.name}).exec()
        .then((data) => {
            if (data) {
                logger.log("info", "Found document for", params.name);
                var HistoryModel = mongoose.model('PredictionHistory');
                var newHistory = new HistoryModel({
                    'state': params.prediction.state
                });
                newHistory.save()
                .then((history) => {
                    logger.log("info", "History save success", history);
                    var PredictionsModel = mongoose.model('Predictions');
                    resolve(PredictionsModel.update({ name: params.name },
                    {
                        $set: {
                            latestState: params.prediction.state
                            // lastUpdated: params.prediction.timestamp
                        },
                        $push: {
                            predictions: history._id
                        }
                    }));
                })
                .catch((err) => {
                    logger.log("ERROR", "History save failed", err);
                    reject(err);
                })
            }
            else {
                logger.log("info", "No document found for", params.name)
                var HistoryModel = mongoose.model('PredictionHistory');
                var newHistory = new HistoryModel({
                    state: params.prediction.state
                });
                newHistory.save()
                .then((history) => {
                    logger.log("info", "History save success");
                    var PredictionsModel = mongoose.model('Predictions');
                    prediction = {
                        name: params.name,
                        latestState: params.prediction.state,
                        // 'lastUpdated': params['timestamp']
                        predictions: [history._id]
                    };
                    var newPredictions = new PredictionsModel(prediction);
                    resolve(newPredictions.save());
                })
                .catch((err) => {
                    logger.log("ERROR", "Predictions save failed", err);
                    reject(err);
                })
            }
        })
        .catch((err) => {
            logger.log("ERROR", "findOne username failed", params.name, err)
            reject(err);
        })
    })
}

Predictions.methods.getLatestState = function(params) {
    logger.log("info", "In Predicitions getLatestState", params);
    return this.model('Predictions').findOne(params).exec()
    .then((data) => {
        if (data) {
            logger.log("info", "Found document for", params.name, data);
            return Promise.resolve(data);
        }
        else {
            return Promise.reject("No document found for " + params.name);
        }
    })
    .catch((err) => {
        logger.log("ERROR", err);
        return Promise.reject("getLatestSate", err);
    })
}

module.exports = function(app) {
    app.models.Predictions = mongoose.model('Predictions', Predictions);
    app.models.PredictionsHistory = mongoose.model('PredictionHistory', PredictionHistory);
    app.models.Cycle = mongoose.model('Cycle', Cycle);
    errorHandling = app.utils.errorHandling;
    logger = app.settings.logger;
}
