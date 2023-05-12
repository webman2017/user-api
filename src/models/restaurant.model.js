module.exports = (sequelize, Sequelize, config) => {
   const Restaurant = sequelize.define(
      'mst_restaurant',
      {
         id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            // defaultValue: Sequelize.INTEGER,
            autoIncrement: true,

         },
         restaurant_id: {
            type: Sequelize.INTEGER,
         },
         cateID: {
            type: Sequelize.INTEGER,
         },
         cateID2: {
            type: Sequelize.INTEGER,
         },
         name_primary: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         name_thai: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         name_english: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         // branch_group: {
         //    type: Sequelize.STRING,
         //    allowNull: false,
         // },
         lat: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         lng: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         tag1: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         tag2: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         defaultPhotothumbnailUrl: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         defaultPhotosmallUrl: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         defaultPhotolargeUrl: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         email: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         callablePhoneno: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         line: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         rating: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         address: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         zipcode: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         priceRange: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         instagram: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         ePickStatus: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         tMonStartTime: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         tMonEndTime: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         tTueStartTime: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         tTueEndTime: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         tWedStartTime: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         tWedEndTime: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         tThuStartTime: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         tThuEndTime: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         tFriStartTime: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         tFriEndTime: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         tSatStartTime: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         tSatEndTime: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         tSunStartTime: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         tSunEndTime: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         guarantee: {
            type: Sequelize.ENUM('Active', 'Inactive'),
            allowNull: false,
         },
         open_status: {
            type: Sequelize.INTEGER,
            allowNull: false,
         },
         price_range: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         restaurantId: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         isMember: {
            type: Sequelize.ENUM('true', 'false'),
            allowNull: false,
         }
      },
      config
   )
   Restaurant.associate = model => {
      // Relations example

      Restaurant.hasMany(model.restaurantMenu, { foreignKey: 'restaurant_id', targetKey: 'restaurant_id', sourceKey: 'restaurant_id' })
      Restaurant.hasOne(model.foodType, { foreignKey: 'id', sourceKey: 'cateID', targetKey: 'cateID' })
      Restaurant.hasOne(model.categoriesRestaurant, { foreignKey: 'cat_id', sourceKey: 'cateID', targetKey: 'cateID' })
      Restaurant.hasOne(model.categoriesRestaurant2, { foreignKey: 'cat_id', sourceKey: 'cateID2', targetKey: 'cateID2' })
      // Restaurant.hasOne(model.categoriesRestaurant, { foreignKey: 'id', sourceKey: 'cateID', targetKey: 'cateID' })
      // Restaurant.hasOne(model.orders, { foreignKey: 'restaurant_id', sourceKey: 'restaurant_id' })
      Restaurant.hasMany(model.promocode, { foreignKey: 'restaurant_id', targetKey: 'restaurant_id', sourceKey: 'restaurant_id' })
      Restaurant.hasMany(model.promotion, { foreignKey: 'restaurant_id', targetKey: 'restaurant_id', sourceKey: 'restaurant_id' })
      Restaurant.belongsTo(model.restaurantOpen, { foreignKey: 'open_status', targetKey: 'open_status', sourceKey: 'open_status' })
      // Restaurant.hasMany(model.restaurantOpen, { foreignKey: 'open_status', targetKey: 'open_status', sourceKey: 'open_status' })
      Restaurant.hasMany(model.bannerRestaurant, { foreignKey: 'restaurant_id', targetKey: 'restaurant_id', sourceKey: 'restaurant_id' })
   }
   return Restaurant
}
