module.exports = (sequelize, Sequelize, config) => {
   const Banner = sequelize.define(
      'mst_advertise_banners',
      {
         iAdvertBannerId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            // defaultValue: Sequelize.INTEGER,
            autoIncrement: true,
         },
         vBannerTitle: {
            type: Sequelize.STRING,
         },
         vBannerImage: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         iDispOrder: {
            type: Sequelize.INTEGER,
            allowNull: true,
         },
         ePosition: {
            type: Sequelize.ENUM('MainPopup', 'MainSlider', 'MainPromotion', 'FoodSlider', 'MainPopular', 'Foodicon', 'DeliverySlider', 'DriverSlider'),
            allowNull: false,
         },
         eStatus: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         eImpression: {
            type: Sequelize.STRING,
            allowNull: true,
         },
         tRedirectUrl: {
            type: Sequelize.STRING,
            allowNull: true,
         },
      },
      config
   )

   Banner.associate = model => {
      // Relations example
      Banner.belongsTo(model.bannerRestaurant, { foreignKey: 'iAdvertBannerId', targetKey: 'banner_id' })
   }

   return Banner
}
