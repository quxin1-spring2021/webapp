const StatsD = require("hot-shots");
// Collect Customized metrics
// Check cloudwatch-config.json for more details
const client = new StatsD();

module.exports = client;