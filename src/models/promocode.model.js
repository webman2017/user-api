module.exports = (sequelize, Sequelize, config) => {
   const promocode = sequelize.define(
      'mst_coupon',
      {
         iCouponId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            // defaultValue: Sequelize.INTEGER,
            autoIncrement: true,

         },

         vCouponCode: {
            type: Sequelize.INTEGER,
         },
         restaurant_id: {
            type: Sequelize.INTEGER,
            // allowNull: false,
         },
         tDescription: {
            type: Sequelize.TEXT,
         },
         fDiscount: {
            type: Sequelize.INTEGER,
         },

         iUsageLimit: {
            type: Sequelize.INTEGER,
            allowNull: false,
         },
         iUsed: {
            type: Sequelize.INTEGER,
            allowNull: false,
         },
         eStatus: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         logo: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         image: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         promocode_type: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         promocode_tag: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         promocode_limit: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         promocode_limit_amount: {
            type: Sequelize.INTEGER,
            allowNull: false,
         },
         promocode_time_limit: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         discount_type: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         paid_type: {
            type: Sequelize.STRING,
            allowNull: false,
         },

         eSystemType: {
            type: Sequelize.ENUM('Ride,Delivery,Uberx,DeliveryAll,G'),
            allowNull: false,
         },
         eType: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         image: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         dActiveDate: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         dExpiryDate: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         eValidityType: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         coupon_active_time: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         sub_title: {
            type: Sequelize.STRING,
            allowNull: false,
         },
      },
      config
   )
   promocode.associate = model => {
      promocode.belongsTo(model.restaurant, { foreignKey: 'restaurant_id', targetKey: 'restaurant_id', sourceKey: 'restaurant_id' })
   }
   return promocode
}
