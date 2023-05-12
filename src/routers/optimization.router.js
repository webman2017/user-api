const { optimization } = require("./../controllers");
const Router = require("koa-joi-router");
const meta = require("./../utils/meta.utils");
const authMiddleware = require("../middleware/auth.middleware");
let Joi = Router.Joi;
const api = Router();
api.prefix("/optimization");
// CRUD
api.route({
    meta: meta("optimization", "optimization"),
    method: "post",
    //ๅ pre: async (ctx, next) => await authMiddleware(ctx, next),
    path: "/optimizationDistance",
    validate: {
        body: {
            jobs: Joi.array().items(Joi.object().keys({
                id: Joi.number().required(),
                service: Joi.number().required(),
                skills: Joi.array().items(Joi),
                location: Joi.array().items(Joi)
            })),
            vehicles: Joi.array().items(Joi.object().keys({
                id: Joi.number().required(),
                profile: Joi.string().required(),
                start: Joi.array().items(Joi),
                skills: Joi.array().items(Joi)
            }))
        },
        type: "json",
    },
    handler: optimization.findAll,
});
module.exports = api;
