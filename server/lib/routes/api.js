module.exports = function(app) {

    var router = app.express.Router();
    var logger = app.settings.logger;

    router.post('/insertRawAccelerometerData', function(req, res, next) {
        logger.log("info", "api/rawAccelerometerData", req.body.rawAccel);
        app.components.RawAccelerometerDataManagement.InsertRawAccelerometerData(req.body.rawAccel)
        .then((data) => {
            logger.log("info", "RawAccelerometerData insert success");
            res.status(200).send("success");
        })
        .catch((error) => {
            logger.log("error", error);
            res.status(400).end();
        })
    });

    return router;
};
