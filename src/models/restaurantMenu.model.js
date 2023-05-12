module.exports = (sequelize, Sequelize, config) => {
   const RestaurantMenu = sequelize.define(
      'mst_restaurant_menu',
      {
         menu_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            // defaultValue: Sequelize.INTEGER,
            autoIncrement: true,
         },
         restaurant_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
         },
         menu_name: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         food_type: {
            type: Sequelize.INTEGER,
            allowNull: false,
         },
         price_exact: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         price_sale: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         price_text: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         recommended: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         description: {
            type: Sequelize.TEXT,
            allowNull: false,
         },
         description: {
            type: Sequelize.TEXT,
            allowNull: false,
         },
         photoId: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         contentUrl: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         photoUrl: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         thumbnailUrl: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         largeUrl: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         smallUrl: {
            type: Sequelize.STRING,
            allowNull: false,
         },
      },
      config
   )
   RestaurantMenu.associate = model => {
      // Relations example
      RestaurantMenu.hasMany(model.foodType, { foreignKey: 'id', targetKey: 'food_type', sourceKey: 'food_type' })
      RestaurantMenu.belongsTo(model.restaurantMenuGroup, { foreignKey: 'menu_id', targetKey: 'restaurant_menu_id', sourceKey: 'menu_id' })
      // RestaurantMenu.hasOne(model.foodType, { foreignKey: 'id', sourceKey: 'food_type', targetKey: 'food_type' })
      RestaurantMenu.hasMany(model.addOn, { foreignKey: 'menu_id', sourceKey: 'menu_id', targetKey: 'menu_id' })
   }
   return RestaurantMenu
}
