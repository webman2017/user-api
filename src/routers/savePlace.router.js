const { savePlace } = require("./../controllers");
const Router = require("koa-joi-router");
const meta = require("./../utils/meta.utils");
const authMiddleware = require("../middleware/auth.middleware");
let Joi = Router.Joi;
const api = Router();
api.prefix("/savePlace");
// CRUD
api.route({
  meta: meta("Get Address by userId", "savePlace"),
  method: "get",
  pre: async (ctx, next) => await authMiddleware(ctx, next),
  path: "/place/:id",
  handler: savePlace.place,
});

api.route({
  meta: meta("checkArea", "savePlace"),
  method: "post",
  pre: async (ctx, next) => await authMiddleware(ctx, next),
  path: "/checkArea",
  validate: {
    body: {
      position: Joi.array().items({
        lat: Joi.number().required(),
        lng: Joi.number().required(),
      }),
    },
    type: "json",
  },
  handler: savePlace.checkPoint,
});

api.route({
  meta: meta("calculateCheckOut", "savePlace"),
  method: "post",
  pre: async (ctx, next) => await authMiddleware(ctx, next),
  path: "/calculateCheckOut",
  validate: {
    body: {
      position: Joi.array().items({
        lat: Joi.number().required(),
        lng: Joi.number().required(),
      }),
    },
    type: "json",
  },
  handler: savePlace.calculateCheckOut,
});




api.route({
  meta: meta("Remove FavAddress", "savePlace"),
  method: "delete",
  pre: async (ctx, next) => await authMiddleware(ctx, next),
  path: "/:id",

  handler: savePlace.destroyPlace,
});
api.route({
  meta: meta("Save FavAddress", "savePlace"),
  method: "post",
  pre: async (ctx, next) => await authMiddleware(ctx, next),
  path: "/update",
  validate: {
    body: {
      place_id: Joi.number().required(),
      user_id: Joi.number().required(),
      title: Joi.string().required(),
      address: Joi.string().required(),
      addressDetails: Joi.string().empty("").default(""),
      contactName: Joi.string().empty("").default(""),
      contactNumber: Joi.string().empty("").default(""),
      note: Joi.string().empty("").default(""),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      types: Joi.string().required(),
    },
    type: "json",
  },
  handler: savePlace.update,
});

api.route({
  meta: meta("near area in saveplace ค้นหาตำแหน่งที่ใกล้ saveplace", "savePlace"),
  pre: async (ctx, next) => await authMiddleware(ctx, next),
  method: "post",
  validate: {
    body: {
      userId: Joi.number().required(),
      lat: Joi.number().required(),
      lng: Joi.number().required(),
      distanceNearSavePlace: 300,
    },
    type: "json",
  },
  path: "/nearSavePlace",
  handler: savePlace.nearSavePlace,
});

module.exports = api;
