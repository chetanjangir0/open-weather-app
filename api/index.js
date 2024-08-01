const app = require('../app');

module.exports = (req, res) => {
  app.handle(req, res);
};