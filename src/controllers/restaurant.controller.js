const { categoriesRestaurant, restaurantOpen, categoriesRestaurant2, restaurant, restaurantMenu, foodType, restaurantMenuGroup, groupName, addOn, promotion, promocode, savePlace } = require('./../models')
// import getHashesNear from 'geohashes-near';
const fs = require("fs");
const uniq = require('lodash/uniq')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const { calDeliveryPrice, calculateGoogleMapDistance, getPagination } = require('./../utils/common.utils')
const orderBy = require('lodash/orderBy')
const es = require('./../configs/es')
const { restaurantDTO } = require('../dto/es.dto')
const { required, exist } = require('joi')
const { filter } = require('lodash')
const foodTypeModel = require('../models/foodType.model')
const savePlaceModel = require('../models/savePlace.model')
const moment = require("moment");
const d = new Date();
const geohash = require('ngeohash');
const { ItemAssignmentContext } = require('twilio/lib/rest/numbers/v2/regulatoryCompliance/bundle/itemAssignment')
const axios = require('axios').default;
let rawdata = fs.readFileSync('./emojis.json')
var currentTimeString = moment().tz('Asia/Bangkok').format('HH:mm:ss')
//check restaurant status
const request = require('request');
const { async } = require('@firebase/util');
const menuMatch = async (search, restaurant_id) => {
   const menuRes = await es.search({
      index: 'restaurant_menu',
      body: {
         query: {
            bool: {
               must:
               {
                  query_string: {
                     query: `%${search}%`,
                     fields: [
                        "menu_name"
                     ],
                  }
               },
               filter: {
                  term: { "restaurant_id": restaurant_id }
               }

            }
         }
      }
   })
   // console.log(menuRes.body.hits.hits)
   return menuRes
}
const countBranch = async (branch) => {
   const countB = await es.count({
      index: 'restaurant',
      body: {
         query: {
            term: { "branch_group": branch }
         }
      }
   })
   return countB
}

const restaurantStatus = async (startTime, endTime) => {
   const timeStart = moment.duration(startTime, "HH:mm:ss");
   const timeCurrent = moment.duration(currentTimeString, "HH:mm:ss")
   const diff = timeCurrent.subtract(timeStart);
   // console.log(diff)
   const h = diff.hours(); // return hours
   const m = diff.minutes(); // return minutes
   // console.log('hour :' + h + 'minute :' + m)
   let dayLabel = ''
   let statusNumber
   // const timeEnd = moment.duration(endTime, "HH:mm:ss");
   // const diffEnd = currentTimeString.subtract(timeEnd);
   // const he = diffEnd.hours(); // return hours
   // const me = diffEnd.minutes(); // return minutes
   // console.log('hour :' + he + 'minute :' + me)
   if (currentTimeString > startTime && currentTimeString < endTime) {
      dayLabel = 'We are open'
      statusNumber = 1
   } else if (currentTimeString > startTime && currentTimeString > endTime || currentTimeString < startTime) {
      dayLabel = 'We are close'
      statusNumber = 0
   }
   // if (h <= 1) {
   //    dayLabel = 'We are open soon'
   // }
   // } else if (me < -30) {
   //    dayLabel = 'We are close soon'
   // }
   return [dayLabel, statusNumber]
}
const getDistance = async (lng, lat, reslng, reslat) => {
   let destination = JSON.stringify({ "locations": [[lng, lat], [reslng, reslat]], "metrics": ["distance"], "units": "km" })
   const header = {
      'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
      'Authorization': '',
      'Content-Type': 'application/json; charset=utf-8'
   }
   let routeData = await axios.post(
      openroute, `${destination}`, {
      headers: header
   }).then(function (response) {


      return response.data.distances[1][0]
   }).catch(function (error) {
      console.log(error);
   });
   return await routeData
}

const formatRestaurantData = async (values, lat, lng) => {
   const date = new Date()
   const dateNow = date.getDay()
   const closedRestaurant = ['tSunEndTime', 'tMonEndTime', 'tTueEndTime', 'tWedEndTime', 'tThuEndTime', 'tFriEndTime', 'tSatEndTime'][dateNow]
   const minutes = date.getMinutes()
   const hours = date.getHours()

   const promise = values.map(async item => {
      const origins = { lat, lng }
      const destinations = { lat: item.lat, lng: item.lng }
      // const distance = await calculateGoogleMapDistance(origins, destinations)
      const distance = ''
      const restaurantDate = item[closedRestaurant].split(':')
      const restaurantHours = restaurantDate[0] <= 0 ? restaurantDate[0] : 22
      const restaurantMinutes = restaurantDate[2]
      const totalMinuteNow = hours * 60 + minutes
      const totalMinuteRestaurant = Number(restaurantHours) * 60 + Number(restaurantMinutes)
      const closed = totalMinuteRestaurant - totalMinuteNow
      return {
         ...item.dataValues,
         deliveryPrice: await calDeliveryPrice(distance),
         googleMapDistance: distance,
         closed: { status: closed <= 30 && closed > 0, minute: closed, message: `ร้านจะปิดใน ${closed} นาที` },
      }
   })
   const data = await Promise.all(promise)
   return orderBy(data, ['googleMapDistance'], ['asc'])
}

module.exports = {
   async restaurantElastic(ctx, _next) {
      const { query } = ctx
      const pageData = query.limit * (query.page - 1)
      const { lat, lng } = query
      const findRestaurant = await es.search(
         {
            from: pageData,
            size: query.limit,
            body: {
               query: {
                  bool: {
                     must: {
                        match_all: {}
                     },
                     filter: {
                        geo_distance: {
                           distance: '100km',
                           location: {
                              lat: lat,
                              lon: lng
                           }
                        }
                     }
                  }
               }
               ,
               sort: [
                  {
                     _geo_distance: {

                        location: {
                           lat: lat,
                           lon: lng
                        },
                        order: "asc",
                        unit: "km"
                     }
                  }
               ]
            }
         })
      // ctx.body = findRestaurant.body.hits.hits
      // const resultRess = await findRestaurant.body.hits.hits
      // const latLngTotal = []
      // resultRess.map(async item => {
      //    latLngTotal.push([parseFloat(item._source.lng), parseFloat(item._source.lat)])
      // });

      // // let destination1 = JSON.stringify({ "locations": [[lng, lat], [parseFloat(item._source.lng), parseFloat(item._source.lat)]], "metrics": ["distance"], "units": "km" })
      // let destination = JSON.stringify({ "coordinates": latLngTotal, "units": "km" })
      // const header = {
      //    'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
      //    'Authorization': '',
      //    'Content-Type': 'application/json; charset=utf-8'
      // }
      // let routeData = await axios.post(
      //    'http://203.151.249.252:8080/ors/v2/directions/driving-car', `${destination}`, {
      //    headers: header
      // }).then(function (response) {
      //    return response
      // }).catch(function (error) {
      //    console.log(error);
      // });



      // console.log(routeData.data)
      // ctx.body = latLngTotal
      // return



      // const distanceElastic = `ROUND((3959 * acos (cos ( radians(${lat}) )* cos( radians( lat ) )* cos( radians( lng ) - radians(${lng}) )+ sin ( radians(${lat}) )* sin( radians( lat )))) * 1.60934,2)`
      const result = []
      const latLng = []
      let day = d.getDay()
      let ll
      let rawdata = fs.readFileSync('./emojis.json')
      let users = JSON.parse(rawdata)
      const resultRes = await findRestaurant.body.hits.hits
      resultRes.map(async item => {
         // let destination = JSON.stringify({ "locations": [[lng, lat], [parseFloat(item._source.lng), parseFloat(item._source.lat)]], "metrics": ["distance"], "units": "km" })
         // const header = {
         //    'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
         //    'Authorization': '',
         //    'Content-Type': 'application/json; charset=utf-8'
         // }
         // let routeData = await axios.post(
         //    openroute, `${destination}`, {
         //    headers: header
         // }).then(function (response) {
         //    return response.data.distances[1][0]
         // }).catch(function (error) {
         //    console.log(error);
         // });
         if (day == 1) {
            ll = restaurantStatus(item._source.tMonStartTime, item._source.tMonEndTime)
         } else if (day == 2) {
            ll = restaurantStatus(item._source.tTueStartTime, item._source.tTueEndTime)
         } else if (day == 3) {
            ll = restaurantStatus(item._source.tWedStartTime, item._source.tWedEndTime)
         } else if (day == 4) {
            ll = restaurantStatus(item._source.tThuStartTime, item._source.tThuEndTime)
         } else if (day == 5) {
            ll = restaurantStatus(item._source.tFriStartTime, item._source.tFriEndTime)
         } else if (day == 6) {
            ll = restaurantStatus(item._source.tSatStartTime, item._source.tSatEndTime)
         } else if (day == 7) {
            ll = restaurantStatus(item._source.tSunStartTime, item._source.tSunEndTime)
         }
         const obj = users.emojis.find(element => {
            let elementArr = element.html.replace(';', ';|')
            const elementArrSpit = elementArr.split('|');
            var term = item._source.categories_restaurant.emoji; // search term (regex pattern)
            var search = new RegExp(term, 'i'); // prepare a regex object
            let b = elementArrSpit.filter(item => search.test(item));
            if (b.length > 0) {
               return element
            } else {
               return null
            }
         });

         const obj2 = users.emojis.find(element => {
            let elementArr = element.html.replace(';', ';|')
            const elementArrSpit = elementArr.split('|');
            var term = item._source.categories_restaurant2.emoji; // search term (regex pattern)
            var search = new RegExp(term, 'i'); // prepare a regex object
            let b = elementArrSpit.filter(item => search.test(item));
            if (b.length > 0) {
               return element
            } else {
               return null
            }
         });
         // const dataa = users.emojis.find(element =>
         // element.html === item._source.categories_restaurant.emoji) || users.emojis.find(element => element.emoji === item._source.categories_restaurant.emoji)
         // console.log(dataa)
         var promiseB = ll.then(async function (resultt) {

            // console.log(resultt)
            // let destination = JSON.stringify({ "locations": [[lng, lat], [parseFloat(item._source.lng), parseFloat(item._source.lat)]], "metrics": ["distance"], "units": "km" })

            let deliveryPricetotal = 0
            if (item.sort[0] < 4) {
               deliveryPricetotal = item._source.deliveryPrice
            }
            else if (item.sort[0] > 4) {
               deliveryPricetotal = 44 + ((item.sort[0] - 4) * 8)
            }


            result.push({
               "id": item._source.id,
               'restaurant_id': item._source.restaurant_id,
               'name_primary': item._source.name_primary,
               'status': resultt[0],
               'statusNumber': resultt[1],
               'name_thai': item._source.name_thai,
               'name_eng': item._source.name_eng,
               "tag1": item._source.tag1,
               "tag2": item._source.tag2,
               "defaultPhotosmallUrl": item._source.defaultPhotosmallUrl,
               "email": item._source.email,
               "callablePhoneno": item._source.callablePhoneno,
               "line": item._source.line,
               "rating": item._source.rating,
               "address": item._source.address,
               "priceRange": item._source.priceRange,
               "instagram": item._source.instagram,
               "ePickStatus": item._source.ePickStatus,
               "tMonStartTime": item._source.tMonStartTime,
               "tMonEndTime": item._source.tMonEndTime,
               "tTueStartTime": item._source.tTueStartTime,
               "tTueEndTime": item._source.tTueEndTime,
               "tWedStartTime": item._source.tWedStartTime,
               "tWedEndTime": item._source.tWedEndTime,
               "tThuStartTime": item._source.tThuStartTime,
               "tThuEndTime": item._source.tThuEndTime,
               "tFriStartTime": item._source.tFriEndTime,
               "tFriEndTime": item._source.tFriEndTime,
               "tSatStartTime": item._source.tSatStartTime,
               "tSatEndTime": item._source.tSatEndTime,
               "tSunStartTime": item._source.tSunStartTime,
               "guarantee": item._source.guarantee,
               "open_status": item._source.open_status,
               "price_range": item._source.price_range,
               "promotions": item._source.promotions,
               "coupons": item._source.coupons,
               "food_type": item._source.food_type,
               "logothumbnailUrl": item._source.logothumbnailUrl,
               "branch_group": item._source.branch_group,
               "defaultPhotothumbnailUrl": item._source.defaultPhotothumbnailUrl,
               "defaultPhotolargeUrl": item._source.defaultPhotolargeUrl,
               "categories_restaurant": item._source.categories_restaurant,
               "categories_emoji": obj,
               "categories_emoji2": obj2,
               "categories_restaurant2": item._source.categories_restaurant2,
               "deliveryPrice": deliveryPricetotal,
               "googleMapDistance": item._source.googleMapDistance,
               "lat": item._source.lat,
               "lng": item._source.lng,
               "location": item._source.location,
               "geohash": item._source.geohash,
               "distance": item.sort[0],
               // "distanceOpenroute": routeData   
            })
         });
      })
      if (findRestaurant.body.hits.hits.length == 0) {
         ctx.body = { selectNewArea: true, message: "success", total: findRestaurant.body.hits.hits.length, items: result }
      } else {
         ctx.body = { selectNewArea: false, message: "success", total: findRestaurant.body.hits.hits.length, items: result }
      }
   },

   async categoryElastic(ctx, _next) {
      const { query } = ctx
      const { lat, lng } = query
      const pageData = query.limit * (query.page - 1)
      Number.prototype.degreeToRadius = function () {
         return this * (Math.PI / 180);
      };
      Number.prototype.radiusToDegree = function () {
         return (180 * this) / Math.PI;
      };

      function getBoundingBox(fsLatitude, fsLongitude, fiDistanceInKM) {

         if (fiDistanceInKM == null || fiDistanceInKM == undefined || fiDistanceInKM == 0)
            fiDistanceInKM = 1;

         var MIN_LAT, MAX_LAT, MIN_LON, MAX_LON, ldEarthRadius, ldDistanceInRadius, lsLatitudeInDegree, lsLongitudeInDegree,
            lsLatitudeInRadius, lsLongitudeInRadius, lsMinLatitude, lsMaxLatitude, lsMinLongitude, lsMaxLongitude, deltaLon;

         // coordinate limits
         MIN_LAT = (-90).degreeToRadius();
         MAX_LAT = (90).degreeToRadius();
         MIN_LON = (-180).degreeToRadius();
         MAX_LON = (180).degreeToRadius();

         // Earth's radius (km)
         ldEarthRadius = 6378.1;

         // angular distance in radians on a great circle
         ldDistanceInRadius = fiDistanceInKM / ldEarthRadius;

         // center point coordinates (deg)
         lsLatitudeInDegree = fsLatitude;
         lsLongitudeInDegree = fsLongitude;

         // center point coordinates (rad)
         lsLatitudeInRadius = lsLatitudeInDegree.degreeToRadius();
         lsLongitudeInRadius = lsLongitudeInDegree.degreeToRadius();

         // minimum and maximum latitudes for given distance
         lsMinLatitude = lsLatitudeInRadius - ldDistanceInRadius;
         lsMaxLatitude = lsLatitudeInRadius + ldDistanceInRadius;

         // minimum and maximum longitudes for given distance
         lsMinLongitude = void 0;
         lsMaxLongitude = void 0;

         // define deltaLon to help determine min and max longitudes
         deltaLon = Math.asin(Math.sin(ldDistanceInRadius) / Math.cos(lsLatitudeInRadius));

         if (lsMinLatitude > MIN_LAT && lsMaxLatitude < MAX_LAT) {
            lsMinLongitude = lsLongitudeInRadius - deltaLon;
            lsMaxLongitude = lsLongitudeInRadius + deltaLon;
            if (lsMinLongitude < MIN_LON) {
               lsMinLongitude = lsMinLongitude + 2 * Math.PI;
            }
            if (lsMaxLongitude > MAX_LON) {
               lsMaxLongitude = lsMaxLongitude - 2 * Math.PI;
            }
         }

         // a pole is within the given distance
         else {
            lsMinLatitude = Math.max(lsMinLatitude, MIN_LAT);
            lsMaxLatitude = Math.min(lsMaxLatitude, MAX_LAT);
            lsMinLongitude = MIN_LON;
            lsMaxLongitude = MAX_LON;
         }

         return [
            lsMinLatitude.radiusToDegree(),
            lsMinLongitude.radiusToDegree(),
            lsMaxLatitude.radiusToDegree(),
            lsMaxLongitude.radiusToDegree()
         ];
      };

      // var lsRectangleLatLong = getBoundingBox(parseFloat(latitude), parseFloat(longitude), lsDistance);
      // if (lsRectangleLatLong != null && lsRectangleLatLong != undefined) {
      //    latLngArr.push({ lat: lsRectangleLatLong[0], lng: lsRectangleLatLong[1] });
      //    latLngArr.push({ lat: lsRectangleLatLong[0], lng: lsRectangleLatLong[3] });
      //    latLngArr.push({ lat: lsRectangleLatLong[2], lng: lsRectangleLatLong[3] });
      //    latLngArr.push({ lat: lsRectangleLatLong[2], lng: lsRectangleLatLong[1] });
      // }
      const cal = getBoundingBox(lat, lng, 5)
      const top = geohash.encode(cal[2], cal[1]);
      const bottom = geohash.encode(cal[0], cal[3]);

      const findRestaurant = await es.search({
         from: pageData,
         size: query.limit,
         index: 'restaurant',
         _source: {
            "includes": [],
            "excludes": []
         },
         body: {

            "query": {
               "bool": {
                  "must": {
                     "match": {
                        "categories_restaurant.cat_id": query.filter
                     }
                  },
                  "filter": {
                     "geo_bounding_box": {
                        "location": {
                           "top_left": top,
                           "bottom_right": bottom
                        }
                     }
                  }
               }
            },
            "sort": [
               {
                  "_geo_distance": {
                     "location": {
                        "lat": lat,
                        "lon": lng
                     },
                     "order": "asc",
                     "unit": "km",
                     // "distance_type": "plane"
                  }
               }
            ]
         }
      })

      const result = []
      let day = d.getDay()
      let ll

      let users = JSON.parse(rawdata)
      const resultRes = await findRestaurant.body.hits.hits
      resultRes.map(item => {
         // console.log(item._source)
         if (day == 1) {
            ll = restaurantStatus(item._source.tMonStartTime, item._source.tMonEndTime)
         } else if (day == 2) {
            ll = restaurantStatus(item._source.tTueStartTime, item._source.tTueEndTime)
         } else if (day == 3) {
            ll = restaurantStatus(item._source.tWedStartTime, item._source.tWedEndTime)
         } else if (day == 4) {
            ll = restaurantStatus(item._source.tThurStartTime, item._source.tThurEndTime)
         } else if (day == 5) {
            ll = restaurantStatus(item._source.tFriStartTime, item._source.tFriEndTime)
         } else if (day == 6) {
            ll = restaurantStatus(item._source.tSatStartTime, item._source.tSatEndTime)
         } else if (day == 7) {
            ll = restaurantStatus(item._source.tSunStartTime, item._source.tSunEndTime)
         }

         const obj = users.emojis.find(element => {
            let elementArr = element.html.replace(';', ';|')
            const elementArrSpit = elementArr.split('|');
            var term = item._source.categories_restaurant.emoji; // search term (regex pattern)
            var search = new RegExp(term, 'i'); // prepare a regex object
            let b = elementArrSpit.filter(item => search.test(item));
            if (b.length > 0) {
               return element
            } else {
               return null
            }
         });

         const obj2 = users.emojis.find(element => {
            let elementArr = element.html.replace(';', ';|')
            const elementArrSpit = elementArr.split('|');
            var term = item._source.categories_restaurant2.emoji; // search term (regex pattern)
            var search = new RegExp(term, 'i'); // prepare a regex object
            let b = elementArrSpit.filter(item => search.test(item));
            if (b.length > 0) {
               return element
            } else {
               return null
            }
         });

         // console.log(ll)
         var promiseB = ll.then(function (resultt) {
            console.log(resultt)
            result.push({
               'status': resultt[0],
               'statusNumber': resultt[1],
               "id": item._source.id,
               'restaurant_id': item._source.restaurant_id,
               'name_primary': item._source.name_primary,
               'status': resultt[0],
               'statusNumber': resultt[1],
               'name_thai': item._source.name_thai,
               'name_eng': item._source.name_eng,
               "tag1": item._source.tag1,
               "tag2": item._source.tag2,
               "defaultPhotosmallUrl": item._source.defaultPhotosmallUrl,
               "email": item._source.email,
               "callablePhoneno": item._source.callablePhoneno,
               "line": item._source.line,
               "rating": item._source.rating,
               "address": item._source.address,
               "priceRange": item._source.priceRange,
               "instagram": item._source.instagram,
               "ePickStatus": item._source.ePickStatus,
               "tMonStartTime": item._source.tMonStartTime,
               "tMonEndTime": item._source.tMonEndTime,
               "tTueStartTime": item._source.tTueStartTime,
               "tTueEndTime": item._source.tTueEndTime,
               "tWedStartTime": item._source.tWedStartTime,
               "tWedEndTime": item._source.tWedEndTime,
               "tThuStartTime": item._source.tThuStartTime,
               "tThuEndTime": item._source.tThuEndTime,
               "tFriStartTime": item._source.tFriEndTime,
               "tFriEndTime": item._source.tFriEndTime,
               "tSatStartTime": item._source.tSatStartTime,
               "tSatEndTime": item._source.tSatEndTime,
               "tSunStartTime": item._source.tSunStartTime,
               "guarantee": item._source.guarantee,
               "open_status": item._source.open_status,
               "price_range": item._source.price_range,
               "promotions": item._source.promotions,
               "coupons": item._source.coupons,
               "food_type": item._source.food_type,
               "logothumbnailUrl": item._source.logothumbnailUrl,
               "branch": item._source.branch,
               "branch_group": item._source.branch_group,
               "defaultPhotothumbnailUrl": item._source.defaultPhotothumbnailUrl,
               "defaultPhotolargeUrl": item._source.defaultPhotolargeUrl,
               "categories_restaurant": item._source.categories_restaurant,
               "categories_emoji": obj,
               "categories_emoji2": obj2,
               "categories_restaurant2": item._source.categories_restaurant2,
               "deliveryPrice": item._source.deliveryPrice,
               "googleMapDistance": item._source.googleMapDistance,
               "lat": item._source.lat,
               "lng": item._source.lng,
               "location": item._source.location,
               "geohash": item._source.geohash,
               "distance": item.sort[0]
            })
         });
      })
      ctx.body = { "message": "success", 'total': findRestaurant.body.hits.hits.length, items: result }
   },
   async filterElastic(ctx, _next) {

      try {
         const filterData = ctx.request.body;
         console.log(filterData.priceRange)
         const findRestaurant = await es.search(
            {
               body: {
                  "query": {
                     "bool": {
                        "must": [
                           {
                              "match": {
                                 "price_range": "≤1000"
                              }
                           },
                           {
                              "match": {
                                 "rating": "0"
                              }
                           }
                        ]
                     }
                  }
               }
            }
         )
         ctx.body = findRestaurant.body.hits.hits
      } catch (error) {
         ctx.body = error.message
      }
      // ctx.body = "xxx"
   },
   async dealAroundElastic(ctx, _next) {
      const { query } = ctx
      const { lat, lng } = query
      // console.log(lat)
      // const userGeo = geohash.encode(lat, lng);
      // console.log(userGeo.substring(0, 5))
      // const geohashUser = userGeo.substring(0, 5)
      // console.log(query.distance)
      // const distanceElastic = `ROUND((3959 * acos (cos ( radians(${lat}) )* cos( radians( lat ) )* cos( radians( lng ) - radians(${lng}) )+ sin ( radians(${lat}) )* sin( radians( lat )))) * 1.60934,2)`
      Number.prototype.degreeToRadius = function () {
         return this * (Math.PI / 180);
      };
      Number.prototype.radiusToDegree = function () {
         return (180 * this) / Math.PI;
      };
      function getBoundingBox(fsLatitude, fsLongitude, fiDistanceInKM) {
         if (fiDistanceInKM == null || fiDistanceInKM == undefined || fiDistanceInKM == 0)
            fiDistanceInKM = 1;

         var MIN_LAT, MAX_LAT, MIN_LON, MAX_LON, ldEarthRadius, ldDistanceInRadius, lsLatitudeInDegree, lsLongitudeInDegree,
            lsLatitudeInRadius, lsLongitudeInRadius, lsMinLatitude, lsMaxLatitude, lsMinLongitude, lsMaxLongitude, deltaLon;

         // coordinate limits
         MIN_LAT = (-90).degreeToRadius();
         MAX_LAT = (90).degreeToRadius();
         MIN_LON = (-180).degreeToRadius();
         MAX_LON = (180).degreeToRadius();

         // Earth's radius (km)
         ldEarthRadius = 6378.1;

         // angular distance in radians on a great circle
         ldDistanceInRadius = fiDistanceInKM / ldEarthRadius;

         // center point coordinates (deg)
         lsLatitudeInDegree = fsLatitude;
         lsLongitudeInDegree = fsLongitude;

         // center point coordinates (rad)
         lsLatitudeInRadius = lsLatitudeInDegree.degreeToRadius();
         lsLongitudeInRadius = lsLongitudeInDegree.degreeToRadius();

         // minimum and maximum latitudes for given distance
         lsMinLatitude = lsLatitudeInRadius - ldDistanceInRadius;
         lsMaxLatitude = lsLatitudeInRadius + ldDistanceInRadius;

         // minimum and maximum longitudes for given distance
         lsMinLongitude = void 0;
         lsMaxLongitude = void 0;

         // define deltaLon to help determine min and max longitudes
         deltaLon = Math.asin(Math.sin(ldDistanceInRadius) / Math.cos(lsLatitudeInRadius));

         if (lsMinLatitude > MIN_LAT && lsMaxLatitude < MAX_LAT) {
            lsMinLongitude = lsLongitudeInRadius - deltaLon;
            lsMaxLongitude = lsLongitudeInRadius + deltaLon;
            if (lsMinLongitude < MIN_LON) {
               lsMinLongitude = lsMinLongitude + 2 * Math.PI;
            }
            if (lsMaxLongitude > MAX_LON) {
               lsMaxLongitude = lsMaxLongitude - 2 * Math.PI;
            }
         }

         // a pole is within the given distance
         else {
            lsMinLatitude = Math.max(lsMinLatitude, MIN_LAT);
            lsMaxLatitude = Math.min(lsMaxLatitude, MAX_LAT);
            lsMinLongitude = MIN_LON;
            lsMaxLongitude = MAX_LON;
         }
         return [
            lsMinLatitude.radiusToDegree(),
            lsMinLongitude.radiusToDegree(),
            lsMaxLatitude.radiusToDegree(),
            lsMaxLongitude.radiusToDegree()
         ];
      };
      // var lsRectangleLatLong = getBoundingBox(parseFloat(latitude), parseFloat(longitude), lsDistance);
      // if (lsRectangleLatLong != null && lsRectangleLatLong != undefined) {
      //    latLngArr.push({ lat: lsRectangleLatLong[0], lng: lsRectangleLatLong[1] });
      //    latLngArr.push({ lat: lsRectangleLatLong[0], lng: lsRectangleLatLong[3] });
      //    latLngArr.push({ lat: lsRectangleLatLong[2], lng: lsRectangleLatLong[3] });
      //    latLngArr.push({ lat: lsRectangleLatLong[2], lng: lsRectangleLatLong[1] });
      // }
      const cal = getBoundingBox(lat, lng, 5)
      // console.log(cal)
      // console.log(lat)
      // console.log(lng)
      const top = geohash.encode(cal[2], cal[1]);
      const bottom = geohash.encode(cal[0], cal[3]);
      // return
      // const findRestaurant = await es.search({
      //    size: 2000,
      //    index: 'restaurant',
      //    body: {
      //       query: {
      //          bool: {
      //             must: {
      //                match: {
      //                   guarantee: "Active"
      //                }
      //             }
      //          }
      //       }
      //    }
      // })

      const findRestaurant = await es.search({
         size: 200,
         index: 'restaurant',
         _source: {
            "includes": [],
            "excludes": []
         },
         body: {

            "query": {
               "bool": {
                  "must": {
                     "match": {
                        guarantee: "Active"
                     }
                  }

               }
            },
            "sort": [
               {
                  "_geo_distance": {
                     "location": {
                        "lat": lat,
                        "lon": lng
                     },
                     "order": "asc",
                     "unit": "km",
                     // "distance_type": "plane"
                  }
               }
            ]
         }
      })

      const result = []
      let day = d.getDay()
      let ll

      let users = JSON.parse(rawdata)
      const resultRes = await findRestaurant.body.hits.hits
      resultRes.map(item => {
         // console.log(item._source)
         if (day == 1) {
            ll = restaurantStatus(item._source.tMonStartTime, item._source.tMonEndTime)
         } else if (day == 2) {
            ll = restaurantStatus(item._source.tTueStartTime, item._source.tTueEndTime)
         } else if (day == 3) {
            ll = restaurantStatus(item._source.tWedStartTime, item._source.tWedEndTime)
         } else if (day == 4) {
            ll = restaurantStatus(item._source.tThurStartTime, item._source.tThurEndTime)
         } else if (day == 5) {
            ll = restaurantStatus(item._source.tFriStartTime, item._source.tFriEndTime)
         } else if (day == 6) {
            ll = restaurantStatus(item._source.tSatStartTime, item._source.tSatEndTime)
         } else if (day == 7) {
            ll = restaurantStatus(item._source.tSunStartTime, item._source.tSunEndTime)
         }

         const obj = users.emojis.find(element => {
            let elementArr = element.html.replace(';', ';|')
            const elementArrSpit = elementArr.split('|');
            var term = item._source.categories_restaurant.emoji; // search term (regex pattern)
            var search = new RegExp(term, 'i'); // prepare a regex object
            let b = elementArrSpit.filter(item => search.test(item));
            if (b.length > 0) {
               return element
            } else {
               return null
            }
         });

         const obj2 = users.emojis.find(element => {
            let elementArr = element.html.replace(';', ';|')
            const elementArrSpit = elementArr.split('|');
            var term = item._source.categories_restaurant2.emoji; // search term (regex pattern)
            var search = new RegExp(term, 'i'); // prepare a regex object
            let b = elementArrSpit.filter(item => search.test(item));
            if (b.length > 0) {
               return element
            } else {
               return null
            }
         });

         // console.log(ll)
         var promiseB = ll.then(function (resultt) {
            console.log(resultt)
            result.push({
               "id": item._source.id,
               'restaurant_id': item._source.restaurant_id,
               'name_primary': item._source.name_primary,
               'status': resultt[0],
               'statusNumber': resultt[1],
               'name_thai': item._source.name_thai,
               'name_eng': item._source.name_eng,
               "tag1": item._source.tag1,
               "tag2": item._source.tag2,
               "defaultPhotosmallUrl": item._source.defaultPhotosmallUrl,
               "email": item._source.email,
               "callablePhoneno": item._source.callablePhoneno,
               "line": item._source.line,
               "rating": item._source.rating,
               "address": item._source.address,
               "priceRange": item._source.priceRange,
               "instagram": item._source.instagram,
               "ePickStatus": item._source.ePickStatus,
               "tMonStartTime": item._source.tMonStartTime,
               "tMonEndTime": item._source.tMonEndTime,
               "tTueStartTime": item._source.tTueStartTime,
               "tTueEndTime": item._source.tTueEndTime,
               "tWedStartTime": item._source.tWedStartTime,
               "tWedEndTime": item._source.tWedEndTime,
               "tThuStartTime": item._source.tThuStartTime,
               "tThuEndTime": item._source.tThuEndTime,
               "tFriStartTime": item._source.tFriEndTime,
               "tFriEndTime": item._source.tFriEndTime,
               "tSatStartTime": item._source.tSatStartTime,
               "tSatEndTime": item._source.tSatEndTime,
               "tSunStartTime": item._source.tSunStartTime,
               "guarantee": item._source.guarantee,
               "open_status": item._source.open_status,
               "price_range": item._source.price_range,
               "promotions": item._source.promotions,
               "coupons": item._source.coupons,
               "food_type": item._source.food_type,
               "logothumbnailUrl": item._source.logothumbnailUrl,
               "branch_group": item._source.branch_group,
               "defaultPhotothumbnailUrl": item._source.defaultPhotothumbnailUrl,
               "defaultPhotolargeUrl": item._source.defaultPhotolargeUrl,
               "categories_restaurant": item._source.categories_restaurant,
               "categories_emoji": obj,
               "categories_emoji2": obj2,
               "categories_restaurant2": item._source.categories_restaurant2,
               "deliveryPrice": item._source.deliveryPrice,
               "googleMapDistance": item._source.googleMapDistance,
               "lat": item._source.lat,
               "lng": item._source.lng,
               "location": item._source.location,
               "geohash": item._source.geohash,
               "distance": item.sort[0]
            })
         });
      })
      ctx.body = { "message": "success", 'total': findRestaurant.body.hits.hits.length, items: result }

      //  ctx.body = { "message": "success", 'total': findRestaurant.body.hits.hits.length, "items": findRestaurant.body.hits.hits }

   },
   async findAll(ctx, _next) {
      try {
         const { query } = ctx
         const { lat, lng } = query
         Number.prototype.degreeToRadius = function () {
            return this * (Math.PI / 180);
         };

         Number.prototype.radiusToDegree = function () {
            return (180 * this) / Math.PI;
         };

         function getBoundingBox(fsLatitude, fsLongitude, fiDistanceInKM) {

            if (fiDistanceInKM == null || fiDistanceInKM == undefined || fiDistanceInKM == 0)
               fiDistanceInKM = 1;

            var MIN_LAT, MAX_LAT, MIN_LON, MAX_LON, ldEarthRadius, ldDistanceInRadius, lsLatitudeInDegree, lsLongitudeInDegree,
               lsLatitudeInRadius, lsLongitudeInRadius, lsMinLatitude, lsMaxLatitude, lsMinLongitude, lsMaxLongitude, deltaLon;

            // coordinate limits
            MIN_LAT = (-90).degreeToRadius();
            MAX_LAT = (90).degreeToRadius();
            MIN_LON = (-180).degreeToRadius();
            MAX_LON = (180).degreeToRadius();

            // Earth's radius (km)
            ldEarthRadius = 6378.1;

            // angular distance in radians on a great circle
            ldDistanceInRadius = fiDistanceInKM / ldEarthRadius;

            // center point coordinates (deg)
            lsLatitudeInDegree = fsLatitude;
            lsLongitudeInDegree = fsLongitude;

            // center point coordinates (rad)
            lsLatitudeInRadius = lsLatitudeInDegree.degreeToRadius();
            lsLongitudeInRadius = lsLongitudeInDegree.degreeToRadius();

            // minimum and maximum latitudes for given distance
            lsMinLatitude = lsLatitudeInRadius - ldDistanceInRadius;
            lsMaxLatitude = lsLatitudeInRadius + ldDistanceInRadius;

            // minimum and maximum longitudes for given distance
            lsMinLongitude = void 0;
            lsMaxLongitude = void 0;

            // define deltaLon to help determine min and max longitudes
            deltaLon = Math.asin(Math.sin(ldDistanceInRadius) / Math.cos(lsLatitudeInRadius));

            if (lsMinLatitude > MIN_LAT && lsMaxLatitude < MAX_LAT) {
               lsMinLongitude = lsLongitudeInRadius - deltaLon;
               lsMaxLongitude = lsLongitudeInRadius + deltaLon;
               if (lsMinLongitude < MIN_LON) {
                  lsMinLongitude = lsMinLongitude + 2 * Math.PI;
               }
               if (lsMaxLongitude > MAX_LON) {
                  lsMaxLongitude = lsMaxLongitude - 2 * Math.PI;
               }
            }

            // a pole is within the given distance
            else {
               lsMinLatitude = Math.max(lsMinLatitude, MIN_LAT);
               lsMaxLatitude = Math.min(lsMaxLatitude, MAX_LAT);
               lsMinLongitude = MIN_LON;
               lsMaxLongitude = MAX_LON;
            }

            return [
               lsMinLatitude.radiusToDegree(),
               lsMinLongitude.radiusToDegree(),
               lsMaxLatitude.radiusToDegree(),
               lsMaxLongitude.radiusToDegree()
            ];
         };



         // var lsRectangleLatLong = getBoundingBox(parseFloat(latitude), parseFloat(longitude), lsDistance);
         // if (lsRectangleLatLong != null && lsRectangleLatLong != undefined) {
         //    latLngArr.push({ lat: lsRectangleLatLong[0], lng: lsRectangleLatLong[1] });
         //    latLngArr.push({ lat: lsRectangleLatLong[0], lng: lsRectangleLatLong[3] });
         //    latLngArr.push({ lat: lsRectangleLatLong[2], lng: lsRectangleLatLong[3] });
         //    latLngArr.push({ lat: lsRectangleLatLong[2], lng: lsRectangleLatLong[1] });
         // }
         const cal = getBoundingBox(lat, lng, 5)
         console.log(cal)
         console.log(lat)
         console.log(lng)

         // return
         const findRestaurant = await es.search({
            // size: 200,
            from: 1,
            size: 200,
            index: 'restaurant',
            _source: {
               "includes": [],
               "excludes": []
            },
            body: {
               "query": {
                  "bool": {
                     "must": {
                        "match_all": {}
                     },
                     "filter": {
                        "geo_bounding_box": {
                           "location": {
                              "top_left": {
                                 "lat": cal[2],
                                 "lon": cal[1]

                              },
                              "bottom_right": {
                                 "lat": cal[0],
                                 "lon": cal[3]
                              }
                           }
                        }
                     }
                  }
               }

            }
         })

         ctx.body = findRestaurant.body.hits
         return

         var latlon = geohash.decode('w4rx5');
         console.log(latlon.latitude);
         console.log(latlon.longitude);
         const fourdigit = geohash.decode_bbox('w4rx5')
         console.log(fourdigit)
         return
         console.log(fourdigit[0])
         const resultData = geohash.bboxes(fourdigit[0], fourdigit[1], fourdigit[2], fourdigit[3], precision = 9)
         console.log(resultData)
         return
         const { lt, like, eq, or, gt } = Op
         const branchGroupId = []
         const data = []
         let restaurantData = []
         let restaurantOutsideData = []
         let restaurantFormatData = []
         let catItem = []

         const queryOptions = getPagination(query.page, query.limit)
         const searchOptions = query.search && {
            [or]: {
               name_thai: {
                  [like]: `%${query.search}%`,
               },
               name_english: {
                  [like]: `%${query.search}%`,
               },
               tag1: {
                  [like]: `%${query.search}%`,
               },
               tag2: {
                  [like]: `%${query.search}%`,
               },
               name_primary: {
                  [like]: `%${query.search}%`,
               },
            },
         }
         const filterOptions = query.filter && {
            [or]: {
               cateID: {
                  [eq]: query.filter,
               },
               cateID2: {
                  [eq]: query.filter,
               },
            },
         }
         const having = !query.search &&
            !query.filter && {
            having: {
               distance: {
                  [lt]: query.distance,
               },
            },
         }

         const calculateDistance = `ROUND((3959 * acos (cos ( radians(${lat}) )* cos( radians( lat ) )* cos( radians( lng ) - radians(${lng}) )+ sin ( radians(${lat}) )* sin( radians( lat )))) * 1.60934,2)`
         restaurantData = await restaurant.findAll({
            ...queryOptions,
            include: [
               { model: foodType, paranoid: false },
               { model: categoriesRestaurant, paranoid: false, attributes: ['cat_id', 'cat_name', 'emoji'] },
               { model: categoriesRestaurant2, paranoid: false, attributes: ['cat_id', 'cat_name', 'emoji'] },
               { model: restaurantOpen, paranoid: false },
               { model: promotion, paranoid: false, attributes: ['promotion_name'] },
               { model: promocode, paranoid: false, attributes: ['vCouponCode'] },
            ],
            attributes: {
               include: [[calculateDistance, 'distance']],
               exclude: ['defaultPhotothumbnailUrl', 'defaultPhotolargeUrl', 'id', 'name_thai', 'name_english', 'zipcode', 'cateID', 'cateID2']

            },
            ...having,
            where: { ...searchOptions, ...filterOptions, status: 0 },
            group: 'branch_group',
            order: [['guarantee', 'ASC'], [Sequelize.col('distance'), 'ASC']],
         })
         // console.log(restaurantData)
         if (restaurantData.length > 0 || query.scroll) {
            restaurantData.map(item => item.branch_group && branchGroupId.push(item.branch_group))
            restaurantFormatData = await formatRestaurantData(restaurantData, lat, lng)
         } else {
            const outsideHaving = !query.search &&
               !query.filter && {
               having: {
                  distance: {
                     [gt]: query.distance,
                  },
               },
            }
            restaurantOutsideData = await restaurant.findAll({
               ...queryOptions,
               include: [{ model: foodType, paranoid: false }],
               attributes: {
                  include: [[calculateDistance, 'distance']],
               },
               ...outsideHaving,
               where: { ...searchOptions, ...filterOptions, status: 0 },
               group: 'branch_group',
               order: [['guarantee', 'ASC'], [Sequelize.col('distance'), 'ASC']],
            })
            restaurantOutsideData.map(item => item.branch_group && branchGroupId.push(item.branch_group))

            restaurantFormatData = await formatRestaurantData(restaurantOutsideData, lat, lng)
         }
         // Push branch id
         const branchData = await restaurant.findAll({
            ...{ query },
            where: {
               branch_group: branchGroupId,
            },
            attributes: { include: [[calculateDistance, 'distance']], },
            having: {
               distance: {
                  [lt]: query.distance,
               },
            },
         })
         const branchFormatData = await formatRestaurantData(branchData, lat, lng)
         restaurantFormatData.map(item =>
            data.push({
               ...item,
               // branch: branchFormatData.filter(branchItem => branchItem.branch_group === item.branch_group),
            })
         )
         ctx.body = {
            message: 'success',
            data: { ...query, count: data.length, items: data },
         }
      } catch (error) {
         ctx.body = error.message
      }
   },
   async restaurantDetail(ctx, _next) {
      let data = []
      let addOnItem = []
      let getRestaurant = ''
      let day = d.getDay()
      let ll
      let rawdata = fs.readFileSync('./emojis.json')
      let users = JSON.parse(rawdata)

      console.log(users)


      const dataId = ctx.request.params
      getRestaurant = await restaurant.findOne({
         where: {
            restaurant_id: dataId.id,
         },
         attributes: {
            include: ['isMember'],
            exclude: ['defaultPhotothumbnailUrl', 'defaultPhotolargeUrl', 'id', 'name_thai', 'name_english', 'zipcode', 'catID', 'catID2']
         },
         include: [
            { model: promotion, paranoid: false, attributes: ['promotion_name'] },
            { model: promocode, paranoid: false, attributes: ['vCouponCode', 'tDescription', 'fDiscount', 'iUsageLimit', 'iUsed', 'eSystemType', 'eType', 'logo', 'image', 'promocode_type', 'promocode_tag', 'promocode_limit', 'promocode_limit_amount', 'discount_type', 'dActiveDate', 'dExpiryDate'] },
            { model: categoriesRestaurant, paranoid: false, attributes: ['cat_id', 'cat_name', 'emoji'] },
            { model: categoriesRestaurant2, paranoid: false, attributes: ['cat_id', 'cat_name', 'emoji'] },
         ],
      })
      const getMenu = await restaurantMenu.findAll({
         where: {
            restaurant_id: dataId.id,
         },
         include: [
            { model: foodType, paranoid: false },

         ],
         attributes: {
            exclude: ['price_text', 'photoId', 'contentUrl', 'photoUrl', 'thumbnailUrl', 'recommended']
         }
      })
      const food_type = await getMenu.map(menus => menus.food_type)
      var uniqueArray = Array.from(new Set(food_type));
      const foodTypeLabel = await foodType.findAll({
         where: {
            id: {
               [Sequelize.Op.in]: uniqueArray
            }
         },
         attributes: {
            exclude: ['related_id',]
         }
      });
      const group = await getMenu.map(menus => menus.menu_id)
      const getMenuGroup = await restaurantMenuGroup.findAll({
         where: {
            restaurant_menu_id: group,
         },
         include: [
            {
               model: groupName, paranoid: false,
               include: { model: addOn, paranoid: false }
            },
         ],
      })
      const groupNameData = []
      getMenuGroup.forEach((element) => {
         groupNameData.push(element.dataValues)
      })
      // console.log(groupNameData)
      // let uniqueObjArray = [
      //    ...new Map(groupNameData.map((item) => [item["group_id", "restaurant_menu_id"], item])).values(),
      // ];
      // console.log("uniqueObjArray", uniqueObjArray);
      // const filterMenu = uniqueObjArray.filter(uniqueObjArray => uniqueObjArray.restaurant_menu_id == 27671)
      // console.log("result", filterMenu)
      // return
      menuResult = []
      getMenu.forEach((element) => {
         // console.log(element)
         // console.log(groupNameData)
         // return
         // console.log(element.dataValues.menu_id)
         const filterMenu = groupNameData.filter(groupNameData => groupNameData.restaurant_menu_id == element.dataValues.menu_id);
         filterMenu.length > 0 ? menuResult.push({ ...element.dataValues, groupName: filterMenu }) : menuResult.push({ ...element.dataValues, groupName: [] })
      })
      //  console.log(menuResult)
      if (day == 1) {
         ll = await restaurantStatus(getRestaurant.dataValues.tMonStartTime, getRestaurant.dataValues.tMonEndTime)
      } else if (day == 2) {
         ll = await restaurantStatus(getRestaurant.dataValues.tTueStartTime, getRestaurant.dataValues.tTueEndTime)
      } else if (day == 3) {
         ll = await restaurantStatus(getRestaurant.dataValues.tWedStartTime, getRestaurant.dataValues.tWedEndTime)
      } else if (day == 4) {
         ll = await restaurantStatus(getRestaurant.dataValues.tThuStartTime, getRestaurant.dataValues.tThuEndTime)
      } else if (day == 5) {
         ll = await restaurantStatus(getRestaurant.dataValues.tFriStartTime, getRestaurant.dataValues.tFriEndTime)
      } else if (day == 6) {
         ll = await restaurantStatus(getRestaurant.dataValues.tSatStartTime, getRestaurant.dataValues.tSatEndTime)
      } else if (day == 7) {
         ll = await restaurantStatus(getRestaurant.dataValues.tSunStartTime, getRestaurant.dataValues.tSunEndTime)
      }
      // console.log(getRestaurant.categories_restaurant.emoji)
      // console.log(getRestaurant.categories_restaurant2.emoji)
      // console.log(ll)

      console.log(getRestaurant)




      // const obj = users.emojis.find(element => {
      //    let elementArr = element.html.replace(';', ';|')
      //    const elementArrSpit = elementArr.split('|');
      //    var term = getRestaurant.categories_restaurant.emoji; // search term (regex pattern)
      //    var search = new RegExp(term, 'i'); // prepare a regex object
      //    let b = elementArrSpit.filter(item => search.test(item));
      //    if (b.length > 0) {
      //       return element
      //    } else {
      //       return element
      //    }
      // });

      // console.log(obj)

      // const obj2 = users.emojis.find(element => {
      //    let elementArr = element.html.replace(';', ';|')
      //    const elementArrSpit = elementArr.split('|');
      //    var term = getRestaurant.categories_restaurant2.emoji; // search term (regex pattern)
      //    var search = new RegExp(term, 'i'); // prepare a regex object
      //    let b = elementArrSpit.filter(item => search.test(item));
      //    if (b.length > 0) {
      //       return element
      //    } else {
      //       return element
      //    }
      // });

      // console.log(obj)
      // console.log(obj2)
      ctx.body = {
         "status": ll[0],
         "statusNumber": ll[1],
         'restaurant': getRestaurant,
         // 'emoji_category': obj,
         // 'emoji_category2': obj2,
         'restaurantStatus': day,
         'currentTime': currentTimeString,
         'foodTypeFilter': foodTypeLabel,
         'menu': menuResult,
      }
   },




   async findDealAroundYou(ctx, _next) {
      try {
         const { query } = ctx
         const { lat, lng } = query
         const { lt, like, eq, or } = Op
         const branchGroupId = []
         const data = []
         const queryOptions = {}
         queryOptions.limit = query.limit
         queryOptions.offset = query.offset
         const searchOptions = query.search && {
            [or]: {
               name_thai: {
                  [like]: `%${query.search}%`,
               },
               name_english: {
                  [like]: `%${query.search}%`,
               },
               tag1: {
                  [like]: `%${query.search}%`,
               },
               tag2: {
                  [like]: `%${query.search}%`,
               },
               name_primary: {
                  [like]: `%${query.search}%`,
               },
            },
         }
         const filterOptions = query.filter && {
            [or]: {
               cateID: {
                  [eq]: query.filter,
               },
               cateID2: {
                  [eq]: query.filter,
               },
            },
         }
         const having = !query.search &&
            !query.filter && {
            having: {
               distance: {
                  [lt]: 12,
               },
            },
         }
         const calculateDistance = `ROUND((3959 * acos (cos ( radians(${lat}) )* cos( radians( lat ) )* cos( radians( lng ) - radians(${lng}) )+ sin ( radians(${lat}) )* sin( radians( lat )))) * 1.60934,2)`
         const restaurantData = await restaurant.findAll({
            ...queryOptions,
            include: [{ model: foodType, paranoid: false },
            { model: categoriesRestaurant, paranoid: false, attributes: ['cat_id', 'cat_name'] },
            { model: categoriesRestaurant2, paranoid: false, attributes: ['cat_id', 'cat_name'] },
            { model: promotion, paranoid: false, attributes: ['promotion_name'] },
            { model: promocode, paranoid: false, attributes: ['vCouponCode'] },
               // { model: categoriesRestaurant2, paranoid: false },
            ],

            attributes: {
               include: [[calculateDistance, 'distance']],
            },
            ...having,
            where: { ...searchOptions, ...filterOptions, status: 0 },
            group: 'branch_group',
            order: [['guarantee', 'ASC'], ['guarantee', 'ASC'], [Sequelize.col('distance'), 'ASC']],
         })
         // Push branch id
         restaurantData.map(item => item.branch_group && branchGroupId.push(item.branch_group))

         const branchData = await restaurant.findAll({
            ...{ query },
            where: {
               branch_group: branchGroupId,
            },
            attributes: { include: [[calculateDistance, 'distance']] },
            having: {
               distance: {
                  [lt]: 12,
               },
            },
            order: [['guarantee', 'ASC'], ['guarantee', 'ASC'], [Sequelize.col('distance'), 'ASC']],
         })
         const branchFormatData = await formatRestaurantData(branchData, lat, lng)
         const restaurantFormatData = await formatRestaurantData(restaurantData, lat, lng)

         restaurantFormatData.map(item =>
            data.push({
               ...item,
               branch: branchFormatData.filter(branchItem => branchItem.branch_group === item.branch_group),
            })
         )

         ctx.body = {
            message: 'success',
            data: { ...query, count: data.length, items: data },
         }
      } catch (error) {
         ctx.body = error.message
      }
   },

   async filterTopLate(ctx, _next) {
      try {
         const { query } = ctx
         const { lat, lng } = query
         const { lt, like, eq, or } = Op
         const branchGroupId = []
         const data = []
         const queryOptions = {}
         queryOptions.limit = query.limit
         queryOptions.offset = query.offset
         const searchOptions = query.search && {
            [or]: {
               name_thai: {
                  [like]: `%${query.search}%`,
               },
               name_english: {
                  [like]: `%${query.search}%`,
               },
               tag1: {
                  [like]: `%${query.search}%`,
               },
               tag2: {
                  [like]: `%${query.search}%`,
               },
               name_primary: {
                  [like]: `%${query.search}%`,
               },
            },
         }
         const filterOptions = query.filter && {
            [or]: {
               cateID: {
                  [eq]: query.filter,
               },
               cateID2: {
                  [eq]: query.filter,
               },
            },
         }
         const having = !query.search &&
            !query.filter && {
            having: {
               distance: {
                  [lt]: 12,
               },
            },
         }
         const calculateDistance = `ROUND((3959 * acos (cos ( radians(${lat}) )* cos( radians( lat ) )* cos( radians( lng ) - radians(${lng}) )+ sin ( radians(${lat}) )* sin( radians( lat )))) * 1.60934,2)`
         const restaurantData = await restaurant.findAll({
            ...queryOptions,
            include: [{ model: foodType, paranoid: false },
            { model: categoriesRestaurant, paranoid: false },
            { model: categoriesRestaurant2, paranoid: false },
               // { model: categoriesRestaurant2, paranoid: false },
            ],
            attributes: {
               include: [[calculateDistance, 'distance']],
            },
            ...having,
            where: { ...searchOptions, ...filterOptions, status: 0, rating: 5 },
            group: 'branch_group',
            order: [['rating', 'DESC'], ['rating', 'DESC'], [Sequelize.col('distance'), 'ASC']],
         })
         // Push branch id
         restaurantData.map(item => item.branch_group && branchGroupId.push(item.branch_group))

         const branchData = await restaurant.findAll({
            ...{ query },
            where: {
               branch_group: branchGroupId,
            },
            attributes: { include: [[calculateDistance, 'distance']] },
            having: {
               distance: {
                  [lt]: 12,
               },
            },
            order: [['guarantee', 'ASC'], ['guarantee', 'ASC'], [Sequelize.col('distance'), 'ASC']],
         })
         const branchFormatData = await formatRestaurantData(branchData, lat, lng)
         const restaurantFormatData = await formatRestaurantData(restaurantData, lat, lng)

         restaurantFormatData.map(item =>
            data.push({
               ...item,
               branch: branchFormatData.filter(branchItem => branchItem.branch_group === item.branch_group),
            })
         )

         ctx.body = {
            message: 'success',
            data: { ...query, count: data.length, items: data },
         }
      } catch (error) {
         ctx.body = error.message
      }
   },
   async findOrderAgain(ctx, _next) {
      try {
         ctx.body = { data: '', message: 'failed' }
      } catch (error) {
         ctx.body = error.message
      }
   },
   async findNearByOneKm(ctx, _next) {
      try {
         const { query } = ctx
         const { lat, lng } = query
         const { lt, like, eq, or, gt, ne, notIn } = Op
         const branchGroupId = []
         const data = []
         let restaurantData = []
         let restaurantOutsideData = []
         let restaurantFormatData = []

         const queryOptions = getPagination(query.page, query.limit)
         const searchOptions = query.search && {
            [or]: {
               name_thai: {
                  [like]: `%${query.search}%`,
               },
               name_english: {
                  [like]: `%${query.search}%`,
               },
               tag1: {
                  [like]: `%${query.search}%`,
               },
               tag2: {
                  [like]: `%${query.search}%`,
               },
               name_primary: {
                  [like]: `%${query.search}%`,
               },
            },
         }
         const filterOptions = query.filter && {
            [or]: {
               cateID: {
                  [eq]: query.filter,
               },
               cateID2: {
                  [eq]: query.filter,
               },
            },
         }
         // const having = !query.search &&
         //    !query.filter && {
         //    having: {
         //       distance: {
         //          [lt]: query.distance,
         //       },
         //    },
         // }

         const calculateDistance = `ROUND((3959 * acos (cos ( radians(${lat}) )* cos( radians( lat ) )* cos( radians( lng ) - radians(${lng}) )+ sin ( radians(${lat}) )* sin( radians( lat )))) * 1.60934,2)`
         restaurantData = await restaurant.findAll({
            ...queryOptions,
            include: [{ model: foodType, paranoid: false },
            { model: categoriesRestaurant, paranoid: false },
            { model: categoriesRestaurant2, paranoid: false },],
            attributes: {
               include: [[calculateDistance, 'distance']],
            },
            ...having,
            where: { ...searchOptions, ...filterOptions, status: 0, restaurant_id: { [notIn]: query.where } },
            group: 'branch_group',
            order: [['guarantee', 'ASC'], [Sequelize.col('distance'), 'ASC']],
         })
         if (restaurantData.length > 0 || query.scroll) {
            restaurantData.map(item => item.branch_group && branchGroupId.push(item.branch_group))
            restaurantFormatData = await formatRestaurantData(restaurantData, lat, lng)
         } else {
            const outsideHaving = !query.search &&
               !query.filter && {
               having: {
                  distance: {
                     [gt]: query.distance,
                  },
               },
            }
            restaurantOutsideData = await restaurant.findAll({
               ...queryOptions,
               include: [{ model: foodType, paranoid: false }],
               attributes: {
                  include: [[calculateDistance, 'distance']],
               },
               ...outsideHaving,
               where: { ...searchOptions, ...filterOptions, status: 0 },
               group: 'branch_group',
               order: [['guarantee', 'ASC'], [Sequelize.col('distance'), 'ASC']],
            })
            restaurantOutsideData.map(item => item.branch_group && branchGroupId.push(item.branch_group))
            restaurantFormatData = await formatRestaurantData(restaurantOutsideData, lat, lng)
         }
         // Push branch id

         const branchData = await restaurant.findAll({
            ...{ query },
            where: {
               branch_group: branchGroupId,
            },
            attributes: { include: [[calculateDistance, 'distance']] },
            having: {
               distance: {
                  [lt]: query.distance,
               },
            },
         })
         const branchFormatData = await formatRestaurantData(branchData, lat, lng)

         restaurantFormatData.map(item =>
            data.push({
               ...item,
               branch: branchFormatData.filter(branchItem => branchItem.branch_group === item.branch_group),
            })
         )

         ctx.body = {
            message: 'success',
            data: { ...query, count: data.length, items: data },
         }
      } catch (error) {
         ctx.body = error.message
      }
   },
   // Elasticsearch
   //match current location
   async matchCurrent(ctx, _next) {
      try {
         const { query } = ctx
         const { lat, lng } = query
         const { lt, like, eq, or, gt, ne, notIn } = Op
         console.log(query.userId)
         // const calculateDistance = `ROUND((3959 * acos (cos ( radians(${lat}) )* cos( radians( vLatitude ) )* cos( radians( vLongitude ) - radians(${lng}) )+ sin ( radians(${lat}) )* sin( radians( vLatitude )))) * 1.60934,2)`
         // ctx = "success"





         // const saveData = await savePlace.findAll({
         //    where: {
         //       iUserId: query.userId,
         //    },
         //    attributes: { include: [[calculateDistance, 'distance']] },
         //    having: {
         //       distance: {
         //          [lt]: query.distance,
         //       },
         //    },
         // })
         // return
         // console.log(saveData)
         ctx.body = "test"
      } catch (error) {
         ctx.body = error.message
      }
   },
   async elasticsearch(ctx, _next) {
      try {
         const { query } = ctx
         const { lt, like, or } = Op
         const { lat, lng } = query
         let resData = []
         let rawdata = fs.readFileSync('./emojis.json')
         let users = JSON.parse(rawdata)

         const dataSearch = await es.search(
            {
               "size": 10000,
               "_source": ["geohash",
                  "id",
                  "name_primary",
                  "restaurant_id",
                  "lat",
                  "lng",
                  "categories_restaurant",
                  "categories_restaurant2",
                  "name_thai", "name_english",
                  "tag1",
                  "tag1",
                  "defaultPhotosmallUrl",
                  "promotions",
                  "coupons",
                  "food_type",
                  "branch_group",
                  "branch",
                  "rating",
                  "guarantee",
                  "menu.smallUrl",
                  "menu.largeUrl",
                  "menu.price_txt",
                  "menu.menu_id"
               ],
               body: {
                  "query": {
                     "bool": {
                        "must": [
                           {
                              "match": {
                                 "name_primary": `${query.search}`
                              }
                           }

                        ],
                        "should": [
                           {
                              "distance_feature": {
                                 "field": "location",
                                 "origin": { "lat": lat, "lon": lng },
                                 "pivot": "100km"
                              }
                           }
                        ]
                     }
                  },
                  "sort": [
                     {
                        "_geo_distance": {

                           "location": {
                              "lat": lat,
                              "lon": lng
                           },
                           "order": "asc",
                           "unit": "km"
                        }
                     }
                  ]
               }
            })
         const searchResultData = dataSearch.body.hits.hits
         let restaurantSearch = []
         searchResultData.map(itemRestaurant => {
            const obj = users.emojis.find(element => {
               let elementArr = element.html.replace(';', ';|')
               const elementArrSpit = elementArr.split('|');
               var term = itemRestaurant._source.categories_restaurant.emoji; // search term (regex pattern)
               var search = new RegExp(term, 'i'); // prepare a regex object
               let b = elementArrSpit.filter(item => search.test(item));
               if (b.length > 0) {
                  return element
               } else {
                  return null
               }
            });
            const obj2 = users.emojis.find(element => {
               let elementArr = element.html.replace(';', ';|')
               const elementArrSpit = elementArr.split('|');
               var term = itemRestaurant._source.categories_restaurant2.emoji; // search term (regex pattern)
               var search = new RegExp(term, 'i'); // prepare a regex object
               let b = elementArrSpit.filter(item => search.test(item));
               if (b.length > 0) {
                  return element
               } else {
                  return null
               }
            });
            restaurantSearch.push({
               branch: itemRestaurant._source.branch,
               id: itemRestaurant._source.id,
               restaurant_id: itemRestaurant._source.restaurant_id,
               name_primary: itemRestaurant._source.name_primary,
               name_thai: itemRestaurant._source.name_thai,
               name_english: itemRestaurant._source.name_english,
               distance: itemRestaurant.sort[0],
               geohash: itemRestaurant._source.geohash,
               lat: itemRestaurant._source.lat,
               lng: itemRestaurant._source.lng,
               "tag1": itemRestaurant._source.tag1,
               "tag2": itemRestaurant._source.tag2,
               "defaultPhotosmallUrl": itemRestaurant._source.defaultPhotosmallUrl,
               "email": itemRestaurant._source.email,
               "callablePhoneno": itemRestaurant._source.callablePhoneno,
               "line": itemRestaurant._source.line,
               "rating": itemRestaurant._source.rating,
               "address": itemRestaurant._source.address,
               "priceRange": itemRestaurant._source.priceRange,
               "instagram": itemRestaurant._source.instagram,
               "promotions": itemRestaurant._source.promotions,
               "coupons": itemRestaurant._source.coupons,
               "food_type": itemRestaurant._source.food_type,
               categories_restaurant: itemRestaurant._source.categories_restaurant,
               categories_restaurant2: itemRestaurant._source.categories_restaurant2,
               "logothumbnailUrl": itemRestaurant._source.logothumbnailUrl,
               "branch_group": itemRestaurant._source.branch_group,
               "status": "",
               "ePickStatus": itemRestaurant._source.ePickStatus,
               "tMonStartTime": itemRestaurant._source.tMonStartTime,
               "tMonEndTime": itemRestaurant._source.tMonEndTime,
               "tTueStartTime": itemRestaurant._source.tTueStartTime,
               "tTueEndTime": itemRestaurant._source.tTueEndTime,
               "tWedStartTime": itemRestaurant._source.tWedStartTime,
               "tWedEndTime": itemRestaurant._source.tWedEndTime,
               "tThuStartTime": itemRestaurant._source.tThuStartTime,
               "tThuEndTime": itemRestaurant._source.tThuEndTime,
               "tFriStartTime": itemRestaurant._source.tFriStartTime,
               "tFriEndTime": itemRestaurant._source.tFriEndTime,
               "tSatStartTime": itemRestaurant._source.tSatStartTime,
               "tSatEndTime": itemRestaurant._source.tSatEndTime,
               "tSunStartTime": itemRestaurant._source.tSunStartTime,
               "tSunEndTime": itemRestaurant._source.tSunEndTime,
               "guarantee": itemRestaurant._source.guarantee,
               "open_status": itemRestaurant._source.open_status,
               categories_emoji: obj,
               categories_emoji2: obj2


            })
         })
         const dataSearchMenu = await es.search(
            {
               "size": 10000,
               "_source": ["geohash",
                  "id",
                  "menu.menu_name",
                  "restaurant_id",
                  "name_primary",
                  "lat",
                  "lng",
                  "categories_restaurant",
                  "categories_restaurant2",
                  "name_thai",
                  "name_english",
                  "tag1",
                  "tag2", "defaultPhotosmallUrl",
                  "promotions",
                  "coupons",
                  "food_type",
                  "branch_group",
                  "branch",
                  "rating",
                  "guarantee",
                  "menu.smallUrl",
                  "menu.largeUrl",
                  "menu.price_text",
                  "menu.menu_id"],
               body: {
                  "query": {
                     "bool": {
                        "must": [
                           {
                              "match": {
                                 "menu.menu_name": `${query.search}`
                              }
                           }

                        ],
                        "should": [
                           {
                              "distance_feature": {
                                 "field": "location",
                                 "origin": { "lat": lat, "lon": lng },
                                 "pivot": "100km"
                              }
                           }
                        ]
                     }
                  },
                  "sort": [
                     {
                        "_geo_distance": {

                           "location": {
                              "lat": lat,
                              "lon": lng
                           },
                           "order": "asc",
                           "unit": "km"
                        }
                     }
                  ]
               }
            })
         let menuFinal = []
         const searchResult = dataSearchMenu.body.hits.hits
         searchResult.map(item => {
            let menuMatch = []
            item._source.menu.map(itemMenu => {
               if (itemMenu.menu_name.includes(query.search) == true) {
                  // let obj = menuFinal.find(o => o.restaurant_id === itemMenu.restaurant_id);
                  menuMatch.push(
                     {
                        menu_id: itemMenu.menu_id,
                        menu_name: itemMenu.menu_name,
                        smallUrl: itemMenu.smallUrl,
                        largeUrl: itemMenu.largeUrl,
                        price_text: itemMenu.price_text

                     }
                  )
               }
            })

            const obj = users.emojis.find(element => {
               let elementArr = element.html.replace(';', ';|')
               const elementArrSpit = elementArr.split('|');
               var term = item._source.categories_restaurant.emoji; // search term (regex pattern)
               var search = new RegExp(term, 'i'); // prepare a regex object
               let b = elementArrSpit.filter(item => search.test(item));
               if (b.length > 0) {
                  return element
               } else {
                  return null
               }
            });

            const obj2 = users.emojis.find(element => {
               let elementArr = element.html.replace(';', ';|')
               const elementArrSpit = elementArr.split('|');
               var term = item._source.categories_restaurant2.emoji; // search term (regex pattern)
               var search = new RegExp(term, 'i'); // prepare a regex object
               let b = elementArrSpit.filter(item => search.test(item));
               if (b.length > 0) {
                  return element
               } else {
                  return null
               }
            });

            menuFinal.push({
               "branch": item._source.branch,
               "id": item._source.id,
               "restaurant_id": item._source.restaurant_id,
               "name_primary": item._source.name_primary,
               "name_thai": item._source.name_thai,
               "name_english": item._source.name_english,
               "lat": item._source.lat,
               "lng": item._source.lng,
               "categories_restaurant": item._source.categories_restaurant,
               "categories_restaurant2": item._source.categories_restaurant2,
               distance: item.sort[0],
               geohash: item._source.geohash,
               "tag1": item._source.tag1,
               "tag2": item._source.tag2,
               "defaultPhotosmallUrl": item._source.defaultPhotosmallUrl,
               "email": item._source.email,
               "callablePhoneno": item._source.callablePhoneno,
               "line": item._source.line,
               "rating": item._source.rating,
               "address": item._source.address,
               "priceRange": item._source.priceRange,
               "instagram": item._source.instagram,
               "promotions": item._source.promotions,
               "coupons": item._source.coupons,
               "food_type": item._source.food_type,
               "logothumbnailUrl": item._source.logothumbnailUrl,
               "branch_group": item._source.branch_group,
               "status": "",
               "ePickStatus": item._source.ePickStatus,
               "tMonStartTime": item._source.tMonStartTime,
               "tMonEndTime": item._source.tMonEndTime,
               "tTueStartTime": item._source.tTueStartTime,
               "tTueEndTime": item._source.tTueEndTime,
               "tWedStartTime": item._source.tWedStartTime,
               "tWedEndTime": item._source.tWedEndTime,
               "tThuStartTime": item._source.tThuStartTime,
               "tThuEndTime": item._source.tThuEndTime,
               "tFriStartTime": item._source.tFriStartTime,
               "tFriEndTime": item._source.tFriEndTime,
               "tSatStartTime": item._source.tSatStartTime,
               "tSatEndTime": item._source.tSatEndTime,
               "tSunStartTime": item._source.tSunStartTime,
               "tSunEndTime": item._source.tSunEndTime,
               "guarantee": item._source.guarantee,
               "open_status": item._source.open_status,
               categories_emoji: obj,
               categories_emoji2: obj2,
               menu: menuMatch

            })
         })
         let totalData = restaurantSearch.concat(menuFinal)
         totalData.sort((a, b) => {
            return a.distance - b.distance;
         });
         totalData.forEach((e) => {
            resData.push(
               {
                  id: e.id,
                  restaurant_id: e.restaurant_id,
                  name_primary: e.name_primary,
                  name_thai: e.name_thai,
                  name_english: e.name_english,
                  lat: parseFloat(e.lat),
                  lng: parseFloat(e.lng),
                  categories_restaurant: e.categories_restaurant,
                  categories_restaurant2: e.categories_restaurant2,
                  distance: e.distance,
                  geohash: e.geohash,
                  tag1: e.tag1,
                  tag2: e.tag2,
                  defaultPhotosmallUrl: e.defaultPhotosmallUrl,
                  email: e.email,
                  callablePhoneno: e.callablePhoneno,
                  line: e.line,
                  rating: e.rating,
                  address: e.address,
                  priceRange: e.priceRange,
                  instagram: e.instagram,
                  promotions: e.promotions,
                  coupons: e.coupons,
                  food_type: e.food_type,
                  logothumbnailUrl: e.logothumbnailUrl,
                  branch: e.branch,
                  branchId: e.branch_group,
                  status: "",
                  ePickStatus: e.ePickStatus,
                  tMonStartTime: e.tMonStartTime,
                  tMonEndTime: e.tMonEndTime,
                  tTueStartTime: e.tTueStartTime,
                  tTueEndTime: e.tTueEndTime,
                  tWedStartTime: e.tWedStartTime,
                  tWedEndTime: e.tWedEndTime,
                  tThuStartTime: e.tThuStartTime,
                  tThuEndTime: e.tThuEndTime,
                  tFriStartTime: e.tFriStartTime,
                  tFriEndTime: e.tFriEndTime,
                  tSatStartTime: e.tSatStartTime,
                  tSatEndTime: e.tSatEndTime,
                  tSunStartTime: e.tSunStartTime,
                  tSunEndTime: e.tSunEndTime,
                  guarantee: e.guarantee,
                  open_status: e.open_status,
                  menu: e.menu,
                  categories_emoji: e.categories_emoji,
                  categories_emoji2: e.categories_emoji2
               }
            )
         });
         if (resData.length == 0) {
            ctx.body = { found: 0 }
         } else {
            ctx.body = resData
         }
         return
         let day = d.getDay()
         resultRes.map(item => {
            if (day == 1) {
               ll = restaurantStatus(item._source.tMonStartTime, item._source.tMonEndTime)
            } else if (day == 2) {
               ll = restaurantStatus(item._source.tTueStartTime, item._source.tTueEndTime)
            } else if (day == 3) {
               ll = restaurantStatus(item._source.tWedStartTime, item._source.tWedEndTime)
            } else if (day == 4) {
               ll = restaurantStatus(item._source.tThurStartTime, item._source.tThurEndTime)
            } else if (day == 5) {
               ll = restaurantStatus(item._source.tFriStartTime, item._source.tFriEndTime)
            } else if (day == 6) {
               ll = restaurantStatus(item._source.tSatStartTime, item._source.tSatEndTime)
            } else if (day == 7) {
               ll = restaurantStatus(item._source.tSunStartTime, item._source.tSunEndTime)
            }
            ll.then(async function (resultt) {
               // console.log(resultt)
               let menu_list = []
               item._source.menu.map(item_menu => {
                  console.log(item_menu)
                  let match = item_menu.menu_name.includes(`${query.search}`);
                  if (match) {
                     menu_list.push(item_menu.menu_name)
                  }

               })
               console.log(menu_list)
               return
               result.push({
                  "id": item._source.id,
                  'restaurant_id': item._source.restaurant_id,
                  'name_primary': item._source.name_primary,
                  'status': resultt,
                  'name_thai': item._source.name_thai,
                  'name_eng': item._source.name_eng,
                  "tag1": item._source.tag1,
                  "tag2": item._source.tag2,
                  "defaultPhotosmallUrl": item._source.defaultPhotosmallUrl,
                  "email": item._source.email,
                  "callablePhoneno": item._source.callablePhoneno,
                  "line": item._source.line,
                  "rating": item._source.rating,
                  "address": item._source.address,
                  "priceRange": item._source.priceRange,
                  "instagram": item._source.instagram,
                  "ePickStatus": item._source.ePickStatus,
                  "tMonStartTime": item._source.tMonStartTime,
                  "tMonEndTime": item._source.tMonEndTime,
                  "tTueStartTime": item._source.tTueStartTime,
                  "tTueEndTime": item._source.tTueEndTime,
                  "tWedStartTime": item._source.tWedStartTime,
                  "tWedEndTime": item._source.tWedEndTime,
                  "tThuStartTime": item._source.tThuStartTime,
                  "tThuEndTime": item._source.tThuEndTime,
                  "tFriStartTime": item._source.tFriStartTime,
                  "tFriEndTime": item._source.tFriEndTime,
                  "tSatStartTime": item._source.tSatStartTime,
                  "tSatEndTime": item._source.tSatEndTime,
                  "tSunStartTime": item._source.tSunStartTime,
                  "guarantee": item._source.guarantee,
                  "open_status": item._source.open_status,
                  "price_range": item._source.price_range,
                  "promotions": item._source.promotions,
                  "coupons": item._source.coupons,
                  "food_type": item._source.food_type,
                  "logothumbnailUrl": item._source.logothumbnailUrl,
                  "branch_group": item._source.branch_group,
                  "defaultPhotothumbnailUrl": item._source.defaultPhotothumbnailUrl,
                  "defaultPhotolargeUrl": item._source.defaultPhotolargeUrl,
                  "categories_restaurant": item._source.categories_restaurant,
                  "categories_restaurant2": item._source.categories_restaurant2,
                  "deliveryPrice": item._source.deliveryPrice,
                  "googleMapDistance": item._source.googleMapDistance,
                  "lat": item._source.lat,
                  "lng": item._source.lng,
                  "location": item._source.location,
                  "geohash": item._source.geohash,
                  // "distance": item.sort[0],
                  "menu": menu_list,
                  // "branch": sumBranch

               })
            })
         })
      } catch (error) {
         ctx.body = error.message
      }
   },
   async branchElastic(ctx, _next) {
      const { query } = ctx
      const { lat, lng } = query
      // console.log(query.branchId)
      const restaurantData = await es.search({
         size: query.size,
         index: 'restaurant',
         body: {
            query: {
               bool: {
                  must: {
                     match: {
                        "branch_group": query.branchId
                     },
                  }
               }
            },
            "sort": [
               {
                  "_geo_distance": {
                     "location": {
                        "lat": lat,
                        "lon": lng
                     },
                     "order": "asc",
                     "unit": "km",
                     // "distance_type": "plane"
                  }
               }
            ]
         }
      })
      let rawdata = fs.readFileSync('./emojis.json')
      let users = JSON.parse(rawdata)

      const dataFinal = []
      const restaurantBranchData = restaurantData.body.hits.hits
      // console.log(restaurantData.body.hits.hits)
      restaurantBranchData.map(item => {
         const obj = users.emojis.find(element => {
            let elementArr = element.html.replace(';', ';|')
            const elementArrSpit = elementArr.split('|');
            var term = item._source.categories_restaurant.emoji; // search term (regex pattern)
            var search = new RegExp(term, 'i'); // prepare a regex object
            let b = elementArrSpit.filter(item => search.test(item));
            if (b.length > 0) {
               return element
            } else {
               return null
            }
         });

         const obj2 = users.emojis.find(element => {
            let elementArr = element.html.replace(';', ';|')
            const elementArrSpit = elementArr.split('|');
            var term = item._source.categories_restaurant2.emoji; // search term (regex pattern)
            var search = new RegExp(term, 'i'); // prepare a regex object
            let b = elementArrSpit.filter(item => search.test(item));
            if (b.length > 0) {
               return element
            } else {
               return null
            }
         });

         console.log(obj)
         console.log(obj2)
         dataFinal.push({
            "restaurant_id": item._source.restaurant_id,
            "name_primary": item._source.name_primary,
            "name_thai": item._source.name_thai,
            "name_eng": item._source.name_eng,
            "tag1": item._source.tag1,
            "tag2": item._source.tag2,
            "defaultPhotosmallUrl": item._source.defaultPhotosmallUrl,
            "email": item._source.email,
            "callablePhoneno": item._source.callablePhoneno,
            "line": item._source.line,
            "rating": item._source.rating,
            "address": item._source.address,
            "priceRange": item._source.priceRange,
            "instagram": item._source.instagram,
            "ePickStatus": item._source.ePickStatus,
            "tMonStartTime": item._source.tMonStartTime,
            "tMonEndTime": item._source.tMonEndTime,
            "tTueStartTime": item._source.tTueStartTime,
            "tTueEndTime": item._source.tTueEndTime,
            "tWedStartTime": item._source.tWedStartTime,
            "tWedEndTime": item._source.tWedEndTime,
            "tThuStartTime": item._source.tThuStartTime,
            "tThuEndTime": item._source.tThuEndTime,
            "tFriStartTime": item._source.tFriStartTime,
            "tFriEndTime": item._source.tFriEndTime,
            "tSatStartTime": item._source.tSatStartTime,
            "tSatEndTime": item._source.tSatEndTime,
            "tSunStartTime": item._source.tSunStartTime,
            "guarantee": item._source.guarantee,
            "open_status": item._source.open_status,
            "price_range": item._source.price_range,
            "promotions": item._source.promotions,
            "coupons": item._source.coupons,
            "food_type": item._source.food_type,
            "logothumbnailUrl": item._source.logothumbnailUrl,
            "branch_group": item._source.branch_group,
            "defaultPhotothumbnailUrl": item._source.defaultPhotothumbnailUrl,
            "defaultPhotolargeUrl": item._source.defaultPhotolargeUrl,
            "categories_restaurant": item._source.categories_restaurant,
            "categories_restaurant2": item._source.categories_restaurant2,
            "googleMapDistance": item._source.googleMapDistance,
            "lat": item._source.lat,
            "lng": item._source.lng,
            "location": item._source.location,
            "geohash": item._source.geohash,
            "distance": item.sort[0],
            "emoji_category": obj,
            "emoji_category2": obj2,

         })

         console.log(item._source.categories_restaurant.emoji)
      })
      // return
      ctx.body = {
         "_source":
            dataFinal
      }
      // ctx.body = restaurantData.body.hits.hits
   },
   // Suggest Elasticsearch
   async suggestion(ctx, _next) {
      try {
         const { query } = ctx
         // const menuData = await es.search({
         //    size: query.size,
         //    index: 'autocomplete',
         //    body: {
         //       query: {
         //          multi_match: {
         //             query: query.search,
         //             minimum_should_match: "70%",
         //             type: "bool_prefix",
         //             operator: "and",
         //             fields: [
         //                "menu_name", "menu_name._2gram", "menu_name._3gram", "name_primary", "name_primary._2gram", "name_primary._3gram"]
         //          }
         //       }
         //    }
         // })
         const menuData = await es.search({
            size: query.size,
            // size: 2000,
            index: 'autocomplete',
            body: {
               "query": {
                  "multi_match": {
                     "query": query.search,
                     "fields": ["menu_name"]
                  }
               }
            }
         })
         // console.log(menuData)
         // console.log(menuData.body.hits.hits)
         let menu = []
         menuData.body.hits.hits.map((item) => {
            let re = new RegExp(`${query.search}*`, 'gi')
            var count = (item._source.menu_name.match(re) || []).length;
            console.log(count);
            if (count < 2) {
               menu.push(item._source.menu_name.trim())
            }
         })
         let unique = [...new Set(menu)];
         ctx.body = { result: unique }
      } catch (error) {
         ctx.body = error.message
      }
   },
   //  Suggest from Database
   async suggestionserver(ctx, _next) {
      try {
         const { query } = ctx
         const { lt, like, or } = Op
         const menuData = await restaurantMenu.findAll({
            // where: { [or]: { branch_group: uniq(branch), restaurant_id: esRestaurantId } },
            limit: 10,
            // include: [
            //    {
            // model: restaurantMenu,
            attributes: ['menu_name'],
            limit: 10,
            where: {
               [or]: {
                  menu_name: {
                     [like]: `${query.search} % `,
                  },
               },
            },
            //    },
            // ],
         })

         ctx.body = menuData
      } catch (error) {
         ctx.body = error.message
      }
   },
   async esRestaurantCreateAllBulk(ctx, _next) {
      try {
         const esIndex = 'test'
         const queryOptions = getPagination(0, 500)
         // console.log({queryOptions})
         const restaurantData = await restaurant.findAll({
            include: [{ model: foodType }, { model: restaurantMenu }],
            ...queryOptions,
         })
         const body = restaurantDTO(restaurantData).flatMap(doc => [{ index: { _index: esIndex, _id: doc.id } }, doc])
         // const createdBulk = await es.bulk({ refresh: true, body })
         ctx.body = body
      } catch (error) {
         ctx.body = error.message
      }
   },

   async findPromotion(ctx, _next) {
      try {
         const data = ctx.request.body
         console.log(data.keyword)
         const promoData = await promotion.findAll({
            // where: {
            //    promotion_name: data.keyword
            // },
         })
         console.log(promoData)
         ctx.body = promoData
      } catch (error) {
         ctx.body = error.message
      }
   },

   async findPromocode(ctx, _next) {
      try {
         const { query } = ctx
         const { lat, lng } = query
         const { lt, like, eq, or, gt } = Op
         const branchGroupId = []
         const data = []
         let restaurantData = []
         let restaurantOutsideData = []
         let restaurantFormatData = []
         let catItem = []

         const queryOptions = getPagination(query.page, query.limit)
         const searchOptions = query.search && {
            [or]: {
               vCouponCode: {
                  [like]: `% ${query.search} % `,
               },
            },
         }
         const filterOptions = query.filter && {
            [or]: {
               vCouponCode: {
                  [eq]: query.filter,
               },
            },
         }
         const having = !query.search &&
            !query.filter && {
            having: {
               distance: {
                  [lt]: query.distance,
               },
            },
         }

         const calculateDistance = `ROUND((3959 * acos(cos(radians(${lat})) * cos(radians(lat)) * cos(radians(lng) - radians(${lng})) + sin(radians(${lat})) * sin(radians(lat)))) * 1.60934, 2)`

         restaurantData = await promocode.findAll({
            ...queryOptions,
            // include: [
            //    //    { model: foodType, paranoid: false },
            //    { model: restaurant, paranoid: false },
            //    //    // { model: categoriesRestaurant2, paranoid: false },
            //    //    { model: promotion, paranoid: false },
            // ],
            // attributes: {
            //    include: [[calculateDistance, 'distance']],
            // },
            ...having,
            where: { ...searchOptions, ...filterOptions },
            // group: 'branch_group',
            // order: [['guarantee', 'ASC'], [Sequelize.col('distance'), 'ASC']],

         })

         console.log(restaurantData)
         // return
         if (restaurantData.length > 0 || query.scroll) {
            // restaurantData.map(item => item.branch_group && branchGroupId.push(item.branch_group))
            // restaurantFormatData = await formatRestaurantData(restaurantData, lat, lng)
         } else {
            // const outsideHaving = !query.search &&
            //    !query.filter && {
            //    having: {
            //       distance: {
            //          [gt]: query.distance,
            //       },
            //    },
            // }
            // restaurantOutsideData = await restaurant.findAll({
            //    ...queryOptions,
            //    include: [{ model: foodType, paranoid: false }],
            //    attributes: {
            //       include: [[calculateDistance, 'distance']],
            //    },
            //    ...outsideHaving,
            //    where: { ...searchOptions, ...filterOptions, status: 0 },
            //    group: 'branch_group',
            //    order: [['guarantee', 'ASC'], [Sequelize.col('distance'), 'ASC']],
            // })
            // restaurantOutsideData.map(item => item.branch_group && branchGroupId.push(item.branch_group))

            // restaurantFormatData = await formatRestaurantData(restaurantOutsideData, lat, lng)
         }
         // Push branch id

         // const branchData = await restaurant.findAll({
         //    ...{ query },
         //    where: {
         //       branch_group: branchGroupId,
         //    },

         //    attributes: { include: [[calculateDistance, 'distance']] },
         //    having: {
         //       distance: {
         //          [lt]: query.distance,
         //       },
         //    },
         // })
         // const branchFormatData = await formatRestaurantData(branchData, lat, lng)

         // restaurantFormatData.map(item =>
         //    data.push({
         //       ...item,
         //       // branch: branchFormatData.filter(branchItem => branchItem.branch_group === item.branch_group),
         //    })
         // )
         ctx.body = {
            message: 'success',
            data: { ...query, count: data.length, items: data },
         }
      } catch (error) {
         ctx.body = error.message
      }
   },

   async filterPromotion(ctx, _next) {
      try {
         const { query } = ctx
         const { lat, lng } = query
         const { lt, like, eq, or, gt } = Op
         const branchGroupId = []
         const data = []
         let restaurantData = []
         let restaurantOutsideData = []
         let restaurantFormatData = []
         let catItem = []

         const queryOptions = getPagination(query.page, query.limit)
         const searchOptions = query.search && {
            [or]: {
               name_thai: {
                  [like]: `% ${query.search} % `,
               },
               name_english: {
                  [like]: `% ${query.search} % `,
               },
               tag1: {
                  [like]: `% ${query.search} % `,
               },
               tag2: {
                  [like]: `% ${query.search} % `,
               },
               name_primary: {
                  [like]: `% ${query.search} % `,
               },
            },
         }
         const filterOptions = query.filter && {
            [or]: {
               cateID: {
                  [eq]: query.filter,
               },
               cateID2: {
                  [eq]: query.filter,
               },
            },
         }
         const having = !query.search &&
            !query.filter && {
            having: {
               distance: {
                  [lt]: query.distance,
               },
            },
         }

         const calculateDistance = `ROUND((3959 * acos(cos(radians(${lat})) * cos(radians(lat)) * cos(radians(lng) - radians(${lng})) + sin(radians(${lat})) * sin(radians(lat)))) * 1.60934, 2)`
         restaurantData = await restaurant.findAll({
            ...queryOptions,
            include: [
               { model: foodType, paranoid: false },
               { model: categoriesRestaurant, paranoid: false },
               { model: categoriesRestaurant2, paranoid: false },
               { model: promotion, paranoid: false },
            ],
            attributes: {
               include: [[calculateDistance, 'distance']],
            },
            ...having,
            where: { ...searchOptions, ...filterOptions, status: 0 },
            group: 'branch_group',
            order: [['guarantee', 'ASC'], [Sequelize.col('distance'), 'ASC']],

         })

         console.log(restaurantData)
         // return
         if (restaurantData.length > 0 || query.scroll) {
            restaurantData.map(item => item.branch_group && branchGroupId.push(item.branch_group))
            restaurantFormatData = await formatRestaurantData(restaurantData, lat, lng)
         } else {
            const outsideHaving = !query.search &&
               !query.filter && {
               having: {
                  distance: {
                     [gt]: query.distance,
                  },
               },
            }
            restaurantOutsideData = await restaurant.findAll({
               ...queryOptions,
               include: [{ model: foodType, paranoid: false }],
               attributes: {
                  include: [[calculateDistance, 'distance']],
               },
               ...outsideHaving,
               where: { ...searchOptions, ...filterOptions, status: 0 },
               group: 'branch_group',
               order: [['guarantee', 'ASC'], [Sequelize.col('distance'), 'ASC']],
            })
            restaurantOutsideData.map(item => item.branch_group && branchGroupId.push(item.branch_group))

            restaurantFormatData = await formatRestaurantData(restaurantOutsideData, lat, lng)
         }
         // Push branch id

         const branchData = await restaurant.findAll({
            ...{ query },
            where: {
               branch_group: branchGroupId,
            },

            attributes: { include: [[calculateDistance, 'distance']] },
            having: {
               distance: {
                  [lt]: query.distance,
               },
            },
         })
         const branchFormatData = await formatRestaurantData(branchData, lat, lng)

         restaurantFormatData.map(item =>
            data.push({
               ...item,
               // branch: branchFormatData.filter(branchItem => branchItem.branch_group === item.branch_group),
            })
         )

         ctx.body = {
            message: 'success',
            data: { ...query, count: data.length, items: data },
         }
      } catch (error) {
         ctx.body = error.message
      }
   },
   async findDistance(ctx, _next) {
      try {
         const { query } = ctx
         const { lat, lng } = query
         const { lt, like, eq, or, gt } = Op
         const branchGroupId = []
         const data = []
         let restaurantData = []
         let restaurantOutsideData = []
         let restaurantFormatData = []
         let catItem = []

         const queryOptions = getPagination(query.page, query.limit)
         const searchOptions = query.search && {
            [or]: {
               name_thai: {
                  [like]: `% ${query.search} % `,
               },
               name_english: {
                  [like]: `% ${query.search} % `,
               },
               tag1: {
                  [like]: `% ${query.search} % `,
               },
               tag2: {
                  [like]: `% ${query.search} % `,
               },
               name_primary: {
                  [like]: `% ${query.search} % `,
               },
            },
         }
         const filterOptions = query.filter && {
            [or]: {
               cateID: {
                  [eq]: query.filter,
               },
               cateID2: {
                  [eq]: query.filter,
               },
            },
         }
         const having = !query.search &&
            !query.filter && {
            having: {
               distance: {
                  [lt]: query.distance,
               },
            },
         }

         const calculateDistance = `ROUND((3959 * acos(cos(radians(${lat})) * cos(radians(lat)) * cos(radians(lng) - radians(${lng})) + sin(radians(${lat})) * sin(radians(lat)))) * 1.60934, 2)`

         restaurantData = await restaurant.findAll({
            ...queryOptions,
            include: [
               { model: foodType, paranoid: false },
               { model: categoriesRestaurant, paranoid: false },
               { model: categoriesRestaurant2, paranoid: false },
               { model: promotion, paranoid: false },
            ],
            attributes: {
               include: [[calculateDistance, 'distance']],
            },
            ...having,
            where: { ...searchOptions, ...filterOptions, status: 0 },
            group: 'branch_group',
            order: [['guarantee', 'ASC'], [Sequelize.col('distance'), 'ASC']],

         })

         console.log(restaurantData)
         // return
         if (restaurantData.length > 0 || query.scroll) {
            restaurantData.map(item => item.branch_group && branchGroupId.push(item.branch_group))
            restaurantFormatData = await formatRestaurantData(restaurantData, lat, lng)
         } else {
            const outsideHaving = !query.search &&
               !query.filter && {
               having: {
                  distance: {
                     [gt]: query.distance,
                  },
               },
            }
            restaurantOutsideData = await restaurant.findAll({
               ...queryOptions,
               include: [{ model: foodType, paranoid: false }],
               attributes: {
                  include: [[calculateDistance, 'distance']],
               },
               ...outsideHaving,
               where: { ...searchOptions, ...filterOptions, status: 0 },
               group: 'branch_group',
               order: [['guarantee', 'ASC'], [Sequelize.col('distance'), 'ASC']],
            })
            restaurantOutsideData.map(item => item.branch_group && branchGroupId.push(item.branch_group))

            restaurantFormatData = await formatRestaurantData(restaurantOutsideData, lat, lng)
         }
         // Push branch id

         const branchData = await restaurant.findAll({
            ...{ query },
            where: {
               branch_group: branchGroupId,
            },

            attributes: { include: [[calculateDistance, 'distance']] },
            having: {
               distance: {
                  [lt]: query.distance,
               },
            },
         })
         const branchFormatData = await formatRestaurantData(branchData, lat, lng)
         restaurantFormatData.map(item =>
            data.push({
               ...item,
               // branch: branchFormatData.filter(branchItem => branchItem.branch_group === item.branch_group),
            })
         )

         ctx.body = {
            message: 'success',
            data: { ...query, count: data.length, items: data },
         }
      } catch (error) {
         ctx.body = error.message
      }
   },
   async findRestaurantByCategory(ctx, _next) {
      try {
         const { query } = ctx
         const { lat, lng } = query
         const { lt, like, eq, or, gt } = Op
         const branchGroupId = []
         const data = []
         let restaurantData = []
         let restaurantOutsideData = []
         let restaurantFormatData = []
         let catItem = []

         const queryOptions = getPagination(query.page, query.limit)
         const searchOptions = query.search && {
            [or]: {
               name_thai: {
                  [like]: `% ${query.search} % `,
               },
               name_english: {
                  [like]: `% ${query.search} % `,
               },
               tag1: {
                  [like]: `% ${query.search} % `,
               },
               tag2: {
                  [like]: `% ${query.search} % `,
               },
               name_primary: {
                  [like]: `% ${query.search} % `,
               },
            },
         }
         const filterOptions = query.filter && {
            [or]: {
               cateID: {
                  [eq]: query.filter,
               },
               cateID2: {
                  [eq]: query.filter,
               },
            },
         }
         const having = !query.search &&
            !query.filter && {
            having: {
               distance: {
                  [lt]: query.distance,
               },
            },
         }

         const calculateDistance = `ROUND((3959 * acos(cos(radians(${lat})) * cos(radians(lat)) * cos(radians(lng) - radians(${lng})) + sin(radians(${lat})) * sin(radians(lat)))) * 1.60934, 2)`
         restaurantData = await restaurant.findAll({
            ...queryOptions,
            include: [
               { model: foodType, paranoid: false },
               { model: categoriesRestaurant, paranoid: false, attributes: ['cat_name', 'iconFullUrl'] },
               // { model: categoriesRestaurant2, paranoid: false, attributes: ['cat_id', 'cat_name', 'emoji'] },
               { model: restaurantOpen, paranoid: false },
               { model: promotion, paranoid: false, attributes: ['promotion_name'] },
               { model: promocode, paranoid: false, attributes: ['vCouponCode'] },
            ],
            attributes: {
               include: [[calculateDistance, 'distance']],
               exclude: ['defaultPhotothumbnailUrl', 'defaultPhotolargeUrl', 'id', 'name_thai', 'name_english', 'zipcode', 'cateID', 'cateID2']

            },
            ...having,
            where: { ...searchOptions, ...filterOptions, status: 0 },
            group: 'branch_group',
            order: [['guarantee', 'ASC'], [Sequelize.col('distance'), 'ASC']],
         })

         console.log(restaurantData)
         // return
         if (restaurantData.length > 0 || query.scroll) {
            restaurantData.map(item => item.branch_group && branchGroupId.push(item.branch_group))
            restaurantFormatData = await formatRestaurantData(restaurantData, lat, lng)
         } else {
            const outsideHaving = !query.search &&
               !query.filter && {
               having: {
                  distance: {
                     [gt]: query.distance,
                  },
               },
            }
            restaurantOutsideData = await restaurant.findAll({
               ...queryOptions,
               include: [{ model: foodType, paranoid: false }],
               attributes: {
                  include: [[calculateDistance, 'distance']],
               },
               ...outsideHaving,
               where: { ...searchOptions, ...filterOptions, status: 0 },
               group: 'branch_group',
               order: [['guarantee', 'ASC'], [Sequelize.col('distance'), 'ASC']],
            })
            restaurantOutsideData.map(item => item.branch_group && branchGroupId.push(item.branch_group))

            restaurantFormatData = await formatRestaurantData(restaurantOutsideData, lat, lng)
         }
         // Push branch id
         const branchData = await restaurant.findAll({
            ...{ query },
            where: {
               branch_group: branchGroupId,
            },
            attributes: { include: [[calculateDistance, 'distance']], },
            having: {
               distance: {
                  [lt]: query.distance,
               },
            },
         })
         const branchFormatData = await formatRestaurantData(branchData, lat, lng)
         restaurantFormatData.map(item =>
            data.push({
               ...item,
               // branch: branchFormatData.filter(branchItem => branchItem.branch_group === item.branch_group),
            })
         )
         ctx.body = {
            message: 'success',
            data: { ...query, count: data.length, items: data },
         }
      } catch (error) {
         ctx.body = error.message
      }
   },
   async FilterAll(ctx, _next) {
      const data = ctx.request.body
      // console.log(data.cuisineId)
      if (data.priceRange !== "" || data.priceRange !== null || data.priceRange !== "null") {
         const menuData = await es.search({
            index: 'restaurant',
            body: {
               query: {
                  bool: {
                     must:
                     {
                        match: {
                           price_range: `${data.priceRange}`,

                        }
                     }
                  }
               }
            }
         })
         ctx.body = menuData.body.hits.hits
      }
      if (data.rating !== null || data.rating !== "null" || data.rating !== 0) {
         const menuData1 = await es.search({
            index: 'restaurant',
            body: {
               query: {
                  bool: {
                     must: {
                        match: {
                           rating: data.rating
                        }
                     }
                  }
               }
            }
         })
         ctx.body = menuData1.body.hits.hits
      }
      if (data.promocode == "null" || data.promocode == null || data.promocode == "") {
         const promocode = await es.search({
            index: 'restaurant',
            body: {
               "query": {
                  "exists": {
                     "field": "coupons"
                  }
               }
            }
         })
         ctx.body = promocode.body.hits.hits
      }
      if (data.cuisineId !== "null" || data.cuisineId !== "") {
         const catData = await es.search({
            index: 'restaurant',
            body: {
               query: {
                  bool: {
                     must: {
                        match: {
                           "categories_restaurant.cat_id": data.cuisineId
                        }
                     }
                  }
               }
            }
         })
         ctx.body = catData.body.hits.hits
      }
   }
}
