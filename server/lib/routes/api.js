module.exports = function(app) {

    var router = app.express.Router();
    var logger = app.settings.logger;

    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    // router.post('/insertRawAccelerometerData', function(req, res, next) {
    //     logger.log("info", "api/rawAccelerometerData", req.body.rawAccel);
    //     app.components.RawAccelerometerDataManagement.InsertRawAccelerometerData(req.body.rawAccel)
    //     .then((data) => {
    //         logger.log("info", "RawAccelerometerData insert success");
    //         res.status(200).send("success");
    //     })
    //     .catch((error) => {
    //         logger.log("error", error);
    //         res.status(400).end();
    //     })
    // });

    router.get('/getRawAccelerometerData', function(req, res, next) {
        logger.log("info", "api/getRawAccelerometerData", req.query);
        app.components.RawAccelerometerDataManagement.GetRawAccelerometerData(req.query)
        .then((data) => {
            logger.log("info", "RawAccelerometerData get success");
            res.status(200).send({"data": data});
        })
        .catch((error) => {
            logger.log("error", error);
            res.status(400).end();
        })
    });

    // GET request for current chair state
    router.get('/getChairState', function(req, res, next) {
        logger.log("info", "GET api/getChairState", req.query);
        app.components.DataManagement.getLatestState(req.query)
        .then((data) => {
            logger.log("info", data)
            res.status(200).send(data);
        })
        .catch((error) => {
            logger.log("ERROR", error)
            res.status(400).end();
        })
    })

    // For testing Predictions.addPrediction purposes
    router.post('/addPrediction', function(req, res) {
        logger.log("info", "POST api/addPrediction", req.body);
        app.components.DataManagement.addPrediction(req.body)
        .then(() => {
            logger.log("info", "POST api/addPrediction success");
            res.status(200).end();
        })
        .catch((err) => {
            logger.log("ERROR", "POST api/addPrediction failed", err);
            res.status(400).end();
        })
    })

    return router;
};
