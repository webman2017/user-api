const axios = require('axios')

module.exports = {
   getPagination: (page, size) => {
      const limit = size ? +size : 3
      const offset = page ? page * limit : 0

      return { limit, offset }
   },
   getElasticsearchPagination: (page, size) => {
      const sizePage = size ? +size : 3
      const from = page ? page * sizePage : 0

      return { from, size: sizePage }
   },
   calDeliveryPrice: distance => {
      const limitDistance = 4
      const basePrice = 44
      const priceOverLimitDistance = 8
      if (!distance) {
         return basePrice
      } else {
         return distance <= 4.0 ? basePrice : (basePrice + (distance - limitDistance) * priceOverLimitDistance).toFixed(0)
      }
   },
   calculateGoogleMapDistance: async (origins, destinations) => {
      const key = 'AIzaSyAdKUv-SsolSpufEtpqSIbH_GNQBXLp-14'
      const { data } = await axios.get(
         `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins.lat},${origins.lng}&destinations=${destinations.lat},${destinations.lng}&language=TH&key=${key}&avoid=tolls`
      )
      return (data?.rows[0]?.elements[0]?.distance.value / 1000) 
   },
}
