var mongoose = require('mongoose');

DatabaseDriver = function DatabaseDriver(app) {
    this.app = app; // A handle to express
    this.logger = app.settings.logger;
    this.mongoose = null;
}
var self; // A link to the component itself

function connectSuccess(mongoose) {
    self.mongoose = mongoose;
    console.log("Connected to the database!");
}

// Connect to a mongodb
DatabaseDriver.prototype.connect = function() {
    var mongoose = require('mongoose');
    // Use bluebird Promise library
//    mongoose.Promise = require('bluebird');

    var db = mongoose.connection;

    db.on('error', function() {
        self.logger.log("Error connecting to the database");
    });
    db.once('open', function() {connectSuccess(mongoose)});

    mongoose.connect("mongodb://localhost:" + self.app.settings.database.port + "/" + self.app.settings.database.database_name,
        self.app.settings.database.options);
};

module.exports = function(app) {
    self = new DatabaseDriver(app);
    app.components.DatabaseDriver = self;
}
