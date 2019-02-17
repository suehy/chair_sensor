var express = require('express');
var bodyParser = require('body-parser');

var app = express()

app.express = express;

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

// General configuration for development/production
require('./config')(app);

require('./utils')(app);

//Models needs to be required after utils
require('./models')(app);

require('./components')(app);

// All components register routes in the /routes directory
require('./routes')(app);

// Require all stats and trackers
//require('./stats')(app);

// Initialize the database client
app.components.DatabaseDriver.connect();

// We will save server related logic (such as port listening)
require('./server')(app);
