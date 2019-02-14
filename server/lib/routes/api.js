module.exports = function(app) {

    var router = app.express.Router();
    var logger = app.settings.logger;

    router.get('/insertRawAccelerometerData', function(req, res, next) {
        logger.log("info", "api/rawAccelerometerData");
        app.components.RawAccelerometerDataManagement.InsertRawAccelerometerData(req.body.rawAccel)
        .then((data) => {
            logger.log("info", "RawAccelerometerData insert success");
            res.status(200).send();
        })
        .catch((error) => {
            logger.log("error", error);
            res.status(400).end();
        })
    });

    return router;
};
