const fs = require('fs')
const path = require('path')
const { Sequelize } = require('sequelize')
const sequelize = require('./../configs/sequelize')
const camelCase = require('camelcase')

const fileName = path.basename(__filename)

const config = {
  timestamps: false,
  freezeTableName: true,
}
const models = {}

models.sequelize = sequelize
models.Sequelize = Sequelize

fs.readdirSync(__dirname)
  .filter((file) => file.indexOf('.') !== 0 && file !== fileName && file.slice(-3) === '.js')
  .forEach((file) => {
    const model = file.split('.')

    const converterCamelCase = camelCase(model[0])
    models[converterCamelCase] = require(path.join(__dirname, file))(
      models.sequelize,
      models.Sequelize,
      config,
    )
  })

// Relation model
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models)
  }
})

// console.log(models)
module.exports = models
