module.exports = function(app) {
    require('./Model')(app);
    require('./DataManagement')(app);
}
