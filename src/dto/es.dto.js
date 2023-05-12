const menuDTO = values => {
   if (!values) return

   let response = []
   values.map(item => {
      response = [
         ...response,
         {
            name: item?.menu_name,
         },
      ]
   })
   return response
}

const restaurantDTO = values => {
   if (!values) return
   let response = []
   values.map(item => {
      response = [
         ...response,
         {
            id: item?.id,
            restaurant_id: item?.restaurant_id,
            branch_group: item?.branch_group,
            name_primary: item?.name_primary,
            name_thai: item?.name_thai,
            name_english: item?.name_english,
            tag1: item?.tag1,
            tag2: item?.tag2,
            menu: menuDTO(item?.restaurant_menus),
         },
      ]
   })

   return response
}

const promoCodeDTO = values => {
   if (!values) return 

   let response = []
   values.map(item => {
      response = [
         ...response,
         {
            id: item?.iCouponId,
            vCouponCode: item?.vCouponCode,
            tDescription: typeof item?.tDescription === 'string' && JSON.parse(item.tDescription),
            fDiscount: item?.fDiscount,
            eSystemType: item.eSystemType,
            restaurant: item.restaurant ? restaurantDTO([item.restaurant]) : {}
         },
      ]
   })

   return response
}

module.exports = {
   restaurantDTO,
   promoCodeDTO,
}
