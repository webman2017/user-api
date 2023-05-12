const { Sequelize } = require('sequelize')

const configs = {
  DB_HOST: '192.168.107.1',
  DB_NAME: 'hubexpre_dbase',
  DB_USER: 'root',
  DB_PASSWORD: 'admin@2020!'
}
const sequelize = new Sequelize(configs.DB_NAME, configs.DB_USER, configs.DB_PASSWORD, {
  host: configs.DB_HOST,
  dialect: 'mysql',
  port: configs.DB_PORT,
})

module.exports = sequelize
