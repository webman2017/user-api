const { savePlace, locationMaster } = require("./../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op
// const attributes = [
//   ["vAddress", "address"],
//   ["vLatitude", "latitude"],
//   ["vLongitude", "longitude"],
//   ["eType", "types"],
//   ["name", "title"],
//   ["address_detail", "addressDetails"],
//   ["contact_name", "contactName"],
//   ["contact_number", "contactNumber"],
//   ["note_to_driver", "note"],
//   ["iUserFavAddressId", "place_id"],
// ];
module.exports = {
  //update saveplace
  async update(ctx, _next) {
    try {
      const {
        place_id, user_id, title, address, addressDetails, contactName, contactNumber,
        note, latitude, longitude, types,
      } = ctx.request.body;
      if (types == 'Work' || types == 'Home') {
        const data = await savePlace.findOne({
          where: {
            iUserId: user_id,
            eType: types
          }
        })
        if (data) {
          await savePlace.update(
            {
              vAddress: address,
              vLatitude: latitude,
              vLongitude: longitude,
              eType: types,
              name: title,
              address_detail: addressDetails,
              contact_name: contactName,
              contact_number: contactNumber,
              note_to_driver: note,
            },
            {
              where: {
                iUserId: user_id,
                eType: types
              },
            }
          )
          ctx.body = { "result": "อัพเดทที่อยู่เรียบร้อย" };
        } else {
          await savePlace.create({
            iUserId: user_id,
            eUserType: "Driver",
            vAddress: address,
            vLatitude: latitude,
            vLongitude: longitude,
            eType: types,
            eStatus: "Active",
            name: title,
            address_detail: addressDetails,
            contact_name: contactName,
            contact_number: contactNumber,
            note_to_driver: note,
          });
        }
        ctx.body = { "result": "บันทึกเรียบร้อย" };
      }
      if (place_id !== 0 && types == "Other") {


        await savePlace.update(
          {
            vAddress: address,
            vLatitude: latitude,
            vLongitude: longitude,
            eType: types,
            name: title,
            address_detail: addressDetails,
            contact_name: contactName,
            contact_number: contactNumber,
            note_to_driver: note,
          },
          {
            where: {
              iUserFavAddressId: place_id,
            },
          }
        );
        ctx.body = { "result": "อัพเดทที่อยู่เรียบร้อย" };
      } else if (place_id == 0 && types == 'Other') {


        // console.log('sxxx')

        // return

        // console.log(types)
        await savePlace.create({
          iUserId: user_id,
          eUserType: "Driver",
          vAddress: address,
          vLatitude: latitude,
          vLongitude: longitude,
          eType: types,
          eStatus: "Active",
          name: title,
          address_detail: addressDetails,
          contact_name: contactName,
          contact_number: contactNumber,
          note_to_driver: note,
        });
        ctx.body = { "result": "บันทึกเรียบร้อย" };
      }
    } catch (err) {
      ctx.err;
    }
  },
  async place(ctx, _next) {
    try {
      let latitude = []
      const { id } = ctx.request.params;

      const getAddr = await savePlace.findAll({
        where: {
          iUserId: id,
        },
        attributes: attributes,
      });
      const favorites = getAddr.filter(
        (addr) => addr.dataValues.types != "Other"
      );
      const other = getAddr.filter((addr) => addr.dataValues.types === "Other");

      ctx.body = {
        data: { favorites, other },
        message: "get location success",
      };
    } catch (err) {
      ctx.err;
    }
  },

  //ลบ save place
  async destroyPlace(ctx, _next) {
    const data = ctx.request.params;
    await savePlace.destroy({
      where: {
        iUserFavAddressId: data.id,
      },
    });
    ctx.body = { 'result': 'ลบที่อยู่เรียบร้อย' };
  },

  //calculate check out order
  async calculateCheckOut(ctx, _next) {
    const axios = require('axios').default;
    // const getDistance = async () => {
    let destination = JSON.stringify({ "locations": [[100.6476191, 13.8340334], [100.6476191, 13.8340334]], "metrics": ["distance"], "units": "km" })
    const header = {
      'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
      'Authorization': '',
      'Content-Type': 'application/json; charset=utf-8'
    }
    let routeData = await axios.post(
      'http://203.151.249.252/:8080/ors/v2/matrix/driving-car', `${destination}`, {
      headers: header
    }).then(function (response) {
      console.log(response.data.distances)
      // return response.data.distances[1][0]
    }).catch(function (error) {
      console.log(error);
    });
    console.log(routeData)
    // return await routeData
    // }
  },
  //เช็คพื้นที่ให้บริการ
  async checkPoint(ctx, _next) {
    // return
    const query = ctx.request.body
    const { lt, like, eq, or } = Op
    const pointInPolygon = require('point-in-polygon');
    const locationMasterData = await locationMaster.findOne({
      where: {
        vLocationName: "First Target"
      }
    })
    var arr = locationMasterData.dataValues.tLatitude
    const a = arr.split(',').map(element => {
      return Number(element);
    });

    var brr = locationMasterData.dataValues.tLongitude;
    const b = brr.split(',').map(element => {
      return Number(element);
    });
    var merged = []
    for (i = 0; i < a.length; i++) {
      merged.push(appendArrays(a[i], b[i]));
    }
    function appendArrays() {
      var temp = []
      for (var i = 0; i < arguments.length; i++) {
        temp.push(arguments[i]);
      }
      return temp;
    }
    const polygon = merged
    let resultList = []
    query.position.map(element => {
      const serviceArea = pointInPolygon([element.lat, element.lng], polygon);
      resultList.push(serviceArea)
    });
    const check = resultList.includes(false);
    if (check) {
      ctx.body = {
        result: false,
        message: "ไม่อยู่ในพื้นที่ให้บริการ",
      }
    } else {
      ctx.body = {
        result: true,
        message: "อยู่ในพื้นที่ให้บริการ",
      }
    }
  },
  async nearSavePlace(ctx, _next) {
    const query = ctx.request.body
    const { lt, like, eq, or } = Op
    const calculateDistance = `ROUND((3959 * acos (cos ( radians(${query.lat}) )* cos( radians( vLatitude ) )* cos( radians( vLongitude ) - radians(${query.lng}) )+ sin ( radians(${query.lat}) )* sin( radians( vLatitude )))) * 1.60934,2)`
    const saveData = await savePlace.findAll({
      // attributes: {
      //   include: [[calculateDistance, 'distance']],
      // },
      where: {
        iUserId: query.userId,
      },
      // having: {
      //   distance: {
      //     [lt]: query.distanceNearSavePlace / 1000,
      //   },
      // },
      // order: [[Sequelize.col('distance'), 'ASC']],
    })
    ctx.body = { result: saveData }
  }
};
