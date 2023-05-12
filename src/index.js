require('dotenv').config()
const { createServer } = require('http')
const Koa = require('koa')
const { server, db } = require('./configs')
const bodyParser = require('koa-bodyparser')
const logger = require('koa-logger')
const koaSwagger = require('koa2-swagger-ui')
const helmet = require('koa-helmet')
const compress = require('koa-compress')

// routers
const routers = require('./routers')
const errorMiddleware = require('./middleware/error.middleware')

const app = new Koa()
app.use(logger())
app.use(
   koaSwagger({
      routePrefix: '/_docs',
      swaggerOptions: {
         url: '/_api.json',
      },
   })
)
app.use(errorMiddleware)
app.use(bodyParser())
app.use(helmet())
app.use(compress())

app.use(routers)
async function bootstrap() {
   db.sequelize
      .authenticate()
      .then(() => {
         db.sequelize.sync({ force: false })
      })
      .catch(error => {
         console.log('Server error : ', error.message)
      })

   return createServer(app.callback()).listen(server.PORT, '0.0.0.0')
}

bootstrap()
   .then(app => console.log(`🚀 Server listening on port ${app.address().port}!`))
   .catch(error => {
      console.error('Unable to run the server because of the following error:')
      process.exit()
   })
