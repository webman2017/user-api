const Router = require("koa-joi-router");
const meta = require("./../utils/meta.utils");
const { user } = require("./../controllers");
const authMiddleware = require("../middleware/auth.middleware");
let Joi = Router.Joi;
const api = Router();
api.prefix("/user");
// CRUD







api.route({
  meta: meta("User Login", "user"),
  // pre: async (ctx, next) => await authMiddleware(ctx, next),
  method: "post",
  path: "/login",
  validate: {
    body: {
      mobile: Joi.string().empty(null).default(null),
      type: Joi.string().required(),
      socialId: Joi.string().empty(null).default(null),
    },
    type: "json",
  },
  handler: user.LogIn,
});
// api.route({
//   meta: meta("User Register", "user"),
//   method: "post",
//   path: "/register",
//   validate: {
//     body: {
//       name: Joi.string().required(),
//       lastname: Joi.string().required(),
//     },
//     type: "json",
//   },
//   handler: user.saveUser,
// });
api.route({
  meta: meta("Send Otp", "user"),
  method: "post",
  path: "/sendotp",
  validate: {
    body: {
      mobile: Joi.string().required(),
    },
    type: "json",
  },
  handler: user.OtpSend,
});
api.route({
  meta: meta("Check Otp", "user"),
  method: "post",
  path: "/checkotp",
  validate: {
    body: {
      otp: Joi.string().required(),
      mobile: Joi.string().required(),
    },
    type: "json",
  },
  handler: user.CheckOtp,
});
api.route({
  meta: meta("update Profile", "user"),
  method: "post",
  pre: async (ctx, next) => await authMiddleware(ctx, next),
  path: "/update",
  validate: {
    body: {
      user_id: Joi.number().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().required(),
      mobile: Joi.string().required(),
      status: Joi.string(),
      cardId: Joi.string().required(),
    },
    type: "json",
  },
  handler: user.updateProfile,
});
api.route({
  meta: meta("update Social", "user"),
  method: "post",
  pre: async (ctx, next) => await authMiddleware(ctx, next),
  path: "/updateSocial",
  validate: {
    body: {
      user_id: Joi.number().required(),
      type: Joi.string().required(),
      socialId: Joi.string().required(),
      status: Joi.string().required(),
    },
    type: "json",
  },
  handler: user.updateSocial,
});
api.route({
  meta: meta("Register", "user"),
  method: "post",
  path: "/register",
  validate: {
    body: {
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string(),
      mobile: Joi.string().required(),
      img: Joi.string().empty("").default(""),
      type: Joi.string().required(),
      socialId: Joi.string().empty(null).default(null),
    },
    type: "json",
  },
  handler: user.register,
});

api.route({
  meta: meta("Height Weight", "user"),
  method: "post",
  pre: async (ctx, next) => await authMiddleware(ctx, next),
  path: "/HeightWeightSave",
  validate: {
    body: {
      userId: Joi.number().required(),
      weight: Joi.number().required(),
      height: Joi.number().required(),
    },
    type: "json",
  },
  handler: user.HeightWeightSave,
});




api.route({
  meta: meta("get id", "user"),

  method: "get",
  // pre: async (ctx, next) => await authMiddleware(ctx, next),
  path: "/",
  handler: user.usergen,
});





api.route({
  meta: meta("get weight Height", "user"),
  // pre: async (ctx, next) => await authMiddleware(ctx, next),
  method: "get",
  pre: async (ctx, next) => await authMiddleware(ctx, next),
  path: "/:userId",
  handler: user.getWeightHeight,
});


api.route({
  meta: meta("get profile", "user"),
  pre: async (ctx, next) => await authMiddleware(ctx, next),
  method: "get",

  path: "/getProfile/:userId",
  handler: user.getProfile,
});


api.route({
  meta: meta("Test", "user"),
  method: "post",
  pre: async (ctx, next) => await authMiddleware(ctx, next),
  path: "/test",
  validate: {
    body: {
      mobile: Joi.string().required(),
    },
    type: "json",
  },
  handler: user.test,
});

api.route({
  meta: meta("Update profile picture", "user"),
  method: "post",
  pre: async (ctx, next) => await authMiddleware(ctx, next),
  path: "/pictureProfile",
  validate: {
    body: {
      iUserId: Joi.number().required(),
      path: Joi.string(),
      filename: Joi.string(),
      mime: Joi.string(),
    },
    type: "json",
  },
  handler: user.pictureProfile,
});

module.exports = api;
