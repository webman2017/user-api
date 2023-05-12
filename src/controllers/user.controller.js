const { user } = require("./../models");
const { otp, userWeightHeigh, maxCount, driver, restaurant } = require("./../models");
const Sequelize = require("sequelize");
const { ClientBase } = require("pg");
const twilio = require("twilio");
const jwt = require("jsonwebtoken");
const { secret } = require("./../configs");
const moment = require("moment");
const Op = Sequelize.Op;
const start = Date.now();
const path = require('path');
const { request } = require("http");
const __basedir = path.resolve();
const fs = require("fs");
const {
  subMobileNumber,
  queryUser,
  updateSocialId,
  createUser,
} = require("../utils/user.utils");
const { orderBy } = require("lodash");
const attributes = [
  ["iUserId", "iUserId"],
  ["vName", "firstName"],
  ["vLastName", "lastName"],
  ["vPhone", "tel"],
  ["vEmail", "email"],
  ["vImgName", "img"],
  ["userId", "user_id"],
  "vFbId",
  "facebook",
  "google_id",
  "google",
  "apple_id",
  "apple",
];
module.exports = {
  async usergen(ctx, _next) {
    const currentYear = new Date().getFullYear()
    const year = currentYear.toString().substring(2)
    const month = (new Date().getMonth() + 1).toString().padStart(2, "0")
    const userData = await user.findAll({
    });
    let max = 0
    // await userData.map((element, index) => {
    //   const num = String(index + 1).padStart(6, '0')
    //   console.log(year + month + num)
    //   user.update({
    //     userId: year + month + num,
    //   },
    //     {
    //       where: {
    //         iUserId: element.dataValues.iUserId

    //       }
    //     })
    //   max = num
    // })
    // await maxCount.update({
    //   max: max
    // },
    //   {
    //     where: {
    //       id: 1
    //     }
    //   })
    // const driverData = await driver.findAll({
    // });

    // const maxCountData = await maxCount.findOne({
    // });

    // console.log(maxCountData.dataValues.max)
    // // return

    // await driverData.map((element, index) => {
    //   const num = String(maxCountData.dataValues.max + index + 1).padStart(6, '0')
    //   console.log(year + month + num)
    //   driver.update({
    //     driverId: year + month + num,
    //   },
    //     {
    //       where: {
    //         iDriverId: element.dataValues.iDriverId

    //       }
    //     })
    //   max = num
    // })
    // await maxCount.update({
    //   max: max
    // },
    //   {
    //     where: {
    //       id: 1
    //     }
    //   })
    const restaurantData = await restaurant.findAll({
    });
    const maxData = await maxCount.findOne({
    });
    console.log(maxData.dataValues.max)
    await restaurantData.map((element, index) => {
      const num = String(maxData.dataValues.max + index + 1).padStart(6, '0')
      // console.log(year + month + num)
      restaurant.update({
        restaurantId: year + month + num,
      },
        {
          where: {
            id: element.dataValues.id

          }
        })
      max = num
    })
    await maxCount.update({
      max: max
    },
      {
        where: {
          id: 1
        }
      })
    ctx.body = 'gen success'
  },
  async LogIn(ctx, _next) {
    try {
      const { mobile, type, socialId } = ctx.request.body;
      const subStringMobile = mobile ? await subMobileNumber(mobile) : null;
      const query = await queryUser(type, subStringMobile, socialId);
      const userData = await user.findOne({
        where: query,
        attributes: attributes,
      });
      console.log(userData)
      // return
      const token = jwt.sign(JSON.stringify(userData), secret);
      ctx.body =
        userData == null
          ? { message: "No Data", data: {} }
          : { message: "success", data: { token } };
      // (ctx.body = "ไม่พบผู้ใช้งาน") : (ctx.body = token);
    } catch (err) {
      ctx.err;
    }
  },

  async OtpSend(ctx, _next) {
    try {
      const { body } = ctx.request;
      const otpcode = Math.floor(100000 + Math.random() * 900000); //Generate Otp
      const accountSid = "ACf696ef5d3de9930d0ffe3f22f6b40b70"; // Your Account SID from www.twilio.com/console
      const authToken = "f8970abb18bf06f0bc37f1bd3cb30917"; // Your Auth Token from www.twilio.com/console
      const client = new twilio(accountSid, authToken);
      // console.log(client);
      console.log(body.mobile)
      const start = Date.now()
      const current = moment(start).format('YYYY-MM-DD HH:mm:ss')

      const checkOtpTimeOut = await otp.findAll({
        where: {
          mobile: body.mobile,
          [Op.or]: [{ created_at: { [Sequelize.Op.gt]: (current) } }]
        }

      })
      console.log(checkOtpTimeOut.length)

      if (checkOtpTimeOut.length > 0) {
        ctx.body = {
          message: 'otp เดิมยังไม่หมดเวลา'
        }
        // var d1 = new Date(checkOtpTimeOut.dataValues.created_at)
        // console.log(d1)
        // d2 = new Date(d1)
        // d2.setMinutes(d1.getMinutes() + parseInt(addMinutes))
        // console.log(d2);
        // const start = Date.now()
        // let d = d2
        //   .toISOString()
        //   .replace(/T/, ' ') // replace T with a space
        //   .replace(/\..+/, '') // delete the dot and everything after
        // console.log(d)

        // const current = moment(start).format('YYYY-MM-DD HH:mm:ss')
        // console.log(current)
        // if (d > current) {
        //   console.log('less')
        // } else {
        //   console.log('over')
        // }

      } else {
        const message = await client.messages.create({
          body: otpcode + " " + "is your HUB Activation Code. It expires in 2 minutes. Do not Share it with anyone.",
          to: body.mobile, // Text this number
          from: "(864) 734-5599", // From a valid Twilio number
        });

        const responseDate =
          moment(start).format("YYYY-MM-DD") +
          " " +
          moment().add(2, "minutes").format("HH:mm:ss");
        await otp.create({
          otp: otpcode,
          mobile: body.mobile,
          used: 0,
          created_at: responseDate,
        });
        ctx.body = message;
      }
      // ctx.body = 'xxx'
    } catch (err) {
      ctx.err;
      ctx.body = err;
    }
  },

  async updateProfile(ctx, _next) {
    try {
      const { body } = ctx.request;
      const mobileUpdate = body.mobile
      const subStringMobile = mobileUpdate ? await subMobileNumber(mobileUpdate) : null;
      const checkPhoneExist = await user.findOne({
        where: {
          iUserId: body.user_id
        }
      })
      // console.log(body.bankAccountNumber)
      // console.log(checkPhoneExist)
      if (checkPhoneExist.dataValues.vPhone == subStringMobile) {
        const userData = await user.update(
          {
            vName: body.firstName,
            vLastName: body.lastName,
            vEmail: body.email,
            vPhone: body.mobile,
            cardId: body.cardId
          },
          {
            where: {
              iUserId: body.user_id,
            },
          }
        );
        ctx.body = { message: "อัพเดทข้อมูลสำเร็จ" }
      } else {
        const phoneExist = await user.findOne({
          where: {
            // iUserId: body.user_id,
            vPhone: subStringMobile
          }
        })
        if (phoneExist == null) {
          const userData = await user.update(
            { vName: body.firstName, vLastName: body.lastName, vEmail: body.email, vPhone: body.mobile },
            {
              where: {
                iUserId: body.user_id,
              },
            }
          );
          ctx.body = { message: "อัพเดทข้อมูลสำเร็จ" }
        } else {
          ctx.body = { message: "เบอร์ซ้ำ" }
        }
      }
    } catch (err) {
      ctx.err;
    }
  },
  async updateSocial(ctx, _next) {
    try {
      const { body } = ctx.request;
      const query = await updateSocialId(body.type, body.socialId, body.status);
      await user.update(query, {
        where: {
          iUserId: body.user_id,
        },
      });
      ctx.body = { message: "อัพเดทข้อมูลสำเร็จ" };
    } catch (err) {
      ctx.err;
    }
  },

  async CheckOtp(ctx, _next) {
    try {
      const { gt } = Op;
      const { body } = ctx.request;
      const otpCheck = body.otp;
      const mobile = body.mobile;
      const subMobile = await subMobileNumber(mobile);
      const responseDate =
        moment(start).format("YYYY-MM-DD") + " " + moment().format("HH:mm:ss");
      const otpData = await otp.findOne({
        where: {
          otp: otpCheck,
          mobile: mobile,
          used: 0,
          created_at: {
            [gt]: responseDate,
          },
        },
      });
      if (otpData === null) {
        ctx.body = { message: "otp ไม่ถูกต้อง" };
      } else {
        const findUser = await user.findOne({
          where: { vPhone: subMobile },
        });
        if (findUser) {
          ctx.body = {
            message: "corret user",
            data: { page: "login" },
          };

        } else {
          ctx.body = { message: "New user", data: { page: "register" } };
        }
      }
    } catch (err) {
      ctx.err;
    }
  },
  async register(ctx, _next) {
    try {
      const { email, mobile, firstName, lastName, img } = ctx.request.body;
      const subStringMobile = await subMobileNumber(mobile);
      const findEmail = await user.findOne({
        where: {
          [Sequelize.Op.or]: [{ vPhone: subStringMobile }, { vEmail: email }],
        },
      });
      if (findEmail) {
        ctx.body = { status: "exist", message: "อีเมลนี้ถูกใช้งานไปแล้ว กรุณาใช้อีเมล์อื่น" };
      } else {
        // const commandCreate = await createUser(
        //   ctx.request.body,
        //   subStringMobile
        // );
        const currentYear = new Date().getFullYear()
        const year = currentYear.toString().substring(2)
        const month = (new Date().getMonth() + 1).toString().padStart(2, "0")
        const maxData = await maxCount.findOne({
        });
        const num = String(maxData.dataValues.max + 1).padStart(6, '0')
        let max = maxData.dataValues.max + 1
        await user.create({
          vName: firstName,
          vLastName: lastName,
          vPhone: subStringMobile,
          vEmail: email,
          vImgName: img,
          userId: year + month + num
          // ...commandCreate
        });
        await maxCount.update({
          max: max
        },
          {
            where: {
              id: 1
            }
          })
        ctx.body = { status: 'success', message: "ลงทะเบียนสำเร็จ" };
      }
    } catch (err) {
      ctx.body = err;
    }
  },
  async HeightWeightSave(ctx, _next) {
    const userData = ctx.request.body
    console.log(userData)
    await userWeightHeight.create({
      user_id: userData.userId,
      weight: userData.weight,
      height: userData.height,
    });
    ctx.body = {
      message: "บันทึกน้ำหนักส่วนสูงสำเร็จ"
    }
  },
  async test(ctx, _next) {
    const userData = ctx.request.body
    const responseDate =
      moment(start).format("YYYY-MM-DD") + " " + moment().format("HH:mm:ss");
    await otp.create({
      otp: 555,
      mobile: '999999',
      used: 0,
      created_at: responseDate
    });
    ctx.body = {
      message: "ok"
    }
  },
  async getWeightHeight(ctx, _next) {
    const body = ctx.request.params
    const getWeightHeightData = await userWeightHeight.findOne({
      where: {
        user_id: body.userId,
      },
      order: [["id", "DESC"]]
    })
    console.log(getWeightHeightData)
    const messageData = ""
    if (getWeightHeightData == null) {
      ctx.body = { weight: 0, height: 0, user_id: body.userId }
    } else {
      ctx.body = getWeightHeightData
    }
  },
  async getProfile(ctx, _next) {
    const body = ctx.request.params
    console.log(body)
    const getProfile = await user.findOne({
      where: {
        userId: body.userId,
      },
      // order: [["id", "DESC"]]
    })
    ctx.body = {
      result: getProfile.dataValues
    }
  },
  async pictureProfile(ctx, _next) {
    const req = ctx.request.body
    const tmp = req.path
    const name = req.filename
    const type = req.mime
    let base64Data = tmp.replace(/^data:image\/[a-z]+;base64,/, "")
    let dir = String(req.iUserId)
    const pathFile = path.join(__basedir, dir)
    fs.existsSync(dir) || fs.mkdirSync(dir, { recursive: true });
    fs.writeFile(path.join(pathFile, name), base64Data, 'base64', function (err) {
      console.log(err)
    })
    const updateUser = await user.update(
      {
        vImgName: name,
      },
      {
        where: {
          iUserId: req.iUserId,
        },
      }
    );
    if (updateUser) {
      ctx.body = { result: "upload success" }
    } else {
      ctx.body = {
        result: "fail"
      }
    }
  },
};
