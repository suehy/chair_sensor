var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var errorHandling;
var logger;

// const strict = {strict: "throw"};

const STATES = {
    "NOTSITTING": 0,
    "SITTING": 1,
    "SITTOSTAND": 2,
    "STANDTOSIT": 3
}
// const UserCycles = new Schema({
const Predictions = new Schema({
    name: {
        type: String,
        required: true
    },
    predictions: [{
        type: [ObjectId], ref: 'PredictionHistory'
    }],
    cycles: [{
        type: [ObjectId], ref: 'Cycle'
    }],
    latestState: {
        type: Number,
        required: true
    }
}, { timestamps: true })

const Cycle = new Schema({}, { timestamps: { createdAt: 'start', updatedAt: 'end' }})

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
})

// Also updates the latestState
Predictions.methods.addPrediction = function(params) {
    logger.log("info", "In Predictions addPrediction", params);
    return new Promise((resolve, reject) => {
        this.model('Predictions').findOne({'name': params.name}).exec()
        .then((data) => {
            if (data) {
                logger.log("info", "Found document for", params.name);
                logger.log("info", "cycles:", data.cycles)
                var HistoryModel = mongoose.model('PredictionHistory');
                var newHistory = new HistoryModel({
                    state: params.prediction.state
                });
                var histPromise = newHistory.save();

                var CycleModel = mongoose.model('Cycle');
                // TODO: handle different states too (PTs)
                if (data.latestState == STATES.NOTSITTING && params.prediction.state == STATES.SITTING) {
                    var newCycle = new CycleModel({});
                    var saveCyclePromise = newCycle.save();
                }
                // TODO: handle different states too (PTs)
                else if (data.latestState == STATES.SITTING && params.prediction.state == STATES.NOTSITTING) {
                    // End the current cycle
                    // Get last elem in cycle array and update 'end' field
                    // Find cycle ID
                    var updateCyclePromise = CycleModel.update({ _id: data.cycles[data.cycles.length-1] }, {});
                }

                Promise.all([histPromise, saveCyclePromise, updateCyclePromise])
                .then(([history, cycle, update]) => {
                    logger.log("info", "History save success", history);

                    var updatesObj = {
                        predictions: history._id,
                    }

                    // Storing new cycle
                    if (cycle) {
                        updatesObj.cycles = cycle._id;
                    }

                    var PredictionsModel = mongoose.model('Predictions');
                    resolve(PredictionsModel.update({ name: params.name },
                    {
                        $set: {
                            latestState: params.prediction.state
                        },
                        $push: updatesObj
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

                    if (params.prediction.state == STATES.SITTING) {
                        var CycleModel = mongoose.model('Cycle');
                        var newCycle = new CycleModel({});
                        newCycle.save()
                        .then((cycle) => {
                            logger.log("info", "Cycle save success");
                            prediction.cycles = [cycle._id];
                            var newPredictions = new PredictionsModel(prediction);
                            resolve(newPredictions.save());
                        })
                    }
                    else {
                        var newPredictions = new PredictionsModel(prediction);
                        resolve(newPredictions.save());
                    }
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
    });
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
