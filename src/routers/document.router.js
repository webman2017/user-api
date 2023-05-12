const Router = require("koa-joi-router");
const meta = require("./../utils/meta.utils");
const { document } = require("./../controllers");
const authMiddleware = require("../middleware/auth.middleware");
let Joi = Router.Joi;
const fs = require("fs");
const api = Router();
var multer = require('multer')
const koaBody = require('koa-body')({ multipart: true, uploadDir: '.' })
var upload = multer()
api.prefix("/document");
api.route({
    meta: meta("Driver Document", "document master"),
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    method: "get",
    path: "/",
    handler: document.getDocument,
});
const Koa = require('koa')
const mime = require('mime-types')
// const Router = require('koa-router')
// const koaBody = require('koa-body')
// / home / admin / hub - project / hubexpress - prod / webimages
api.post('/upload', koaBody, async ctx => {
    try {
        const userId = ctx.request.body
        console.log(userId)
        // console.log('files', ctx.request.body)
        // const { path, name, type } = ctx.request.files.avatar
        // const { pathDriver, name1, type1 } = ctx.request.files.drivingLicense
        // const { pathAgreement, agreement } = ctx.request.files.agreement
        // const { pathCarRegistration, carRegistration } = ctx.request.files.carRegistration
        // const { pathCriminal, criminalRecord } = ctx.request.files.criminalRecord
        // const { pathLetter, letterOfConsent } = ctx.request.files.letterOfConsent
        // const { pathqrCode, qrCode } = ctx.request.files.qrCode
        // fs.existsSync(userId) || fs.mkdirSync(userId);
        // console.log(userId)
        // const fileExtension = mime.extension(type)
        // console.log(`path: ${path}`)
        // console.log(`filename: ${name}`)
        // console.log(`type: ${type}`)
        // console.log(`fileExtension: ${fileExtension}`)
        // fs.copyFileSync(path, `${userId}/${name}`)
        // fs.copyFileSync(pathDriver, `${userId}/${name1}`)
        // fs.copyFileSync(pathAgreement, `${userId}/${agreement}`)
        // fs.copyFileSync(pathCarRegistration, `${userId}/${carRegistration}`)
        // fs.copyFileSync(pathCriminal, `${userId}/${criminalRecord}`)
        // fs.copyFileSync(pathLetter, `${userId}/${letterOfConsent}`)
        // fs.copyFileSync(pathqrCode, `${userId}/${qrCode}`)
        ctx.body = "copy image success"
        // ctx.redirect('/')
    } catch (err) {
        console.log(`error ${err.message}`)
        // await ctx.body=('error', { message: err.message })
    }
})

api.route({
    meta: meta("Upload Document", "upload document"),
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    method: "post",

    validate: {
        body: {
            doc_userid: Joi.number().required(),
            // file: Joi.array().items(Joi.object().keys({
            doc_masterid: Joi.number(),
            path: Joi.string(),
            filename: Joi.string(),
            mime: Joi.string()
            // }),
            // ),
        },
        type: 'json',
    },
    path: "/",
    handler: document.uploadDocumentFile,
});

api.route({
    meta: meta("get Document", "upload document"),
    method: "get",
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    path: "/:id",
    handler: document.getDocumentDriver,
});

api.route({
    meta: meta("delete Document", "upload document"),
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    method: "delete",
    path: "/:id",
    handler: document.deleteDocument,
});

module.exports = api;
