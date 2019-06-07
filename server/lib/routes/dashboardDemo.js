const path = require("path");

module.exports = function(app) {
    var router = app.express.Router();
    var logger = app.settings.logger;

    router.get('/', function(req, res) {
        logger.log("info", 'GET ..' + req.originalUrl);
        // logger.log("info", 'req.session.id: ' + req.session.id);
        // logger.log("info", req.query);
        // logger.log("info", 'cookies: ', req.cookies);

        res.sendFile(path.join(__dirname, "../views/html", "pahoDemo.html"));
    })

    return router;
}
