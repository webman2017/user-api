const models = require("./../models")

module.exports = {
  server: {
    PORT: 9146,
  },
  db: models,
  secret: 'hubexpress'
}
