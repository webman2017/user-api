const { secret } = require('./../configs')
const jwt = require('jsonwebtoken')
// const { server }  = configs
 
module.exports = async (ctx, next) => {
   const { authorization: token } = ctx.request.headers

   if (!token) {
      ctx.status = 403
      ctx.body = 'No token provided!'
      return
   }

//    const { secret } = server

   return jwt.verify(token, secret, (err, decoded) => {
      if (err) {
         ctx.status = 401
         ctx.body = 'Unauthorized'
         return
      }
      ctx.request.adminUser = decoded
      return next()
   })
}
