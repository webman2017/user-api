const Router = require('koa-joi-router')
const {SwaggerAPI} = require('koa-joi-router-docs')
const fs = require('fs')
const path = require('path')

const api = Router()
const fileName = path.basename(__filename)
const swaggerAPI = new SwaggerAPI()  

api.prefix('/') 
fs.readdirSync(__dirname)
   .filter(file => {
      return (
         file.indexOf('.') !== 0 &&
         file !== fileName &&
         file.split(-3) !== '.js'
      )
   })
   .forEach(file => {
      const route = require(path.join(__dirname, file))
      api.use(route.middleware())
      swaggerAPI.addJoiRouter(route)
   })  

let spec = swaggerAPI.generateSpec({
   info: {
      title: 'Hub documents API',
      description: 'API for hub',
      version: '1.0',
   }, 
   basePath: '/',
   security: [
      {
        Authorization: {
          type: 'apiKey',
          name: 'authorization',
          in: 'header',
        },
      },
    ],
    securityDefinitions: {
      Authorization: {
        type: 'apiKey',
        name: 'authorization',
        in: 'header',
      },
    },
}) 
 
api.get('/_api.json', async ctx => {
   ctx.body = JSON.stringify(spec, null,  2)
})
module.exports = api.middleware()
