module.exports = (sequelize, Sequelize, config) => {
   const promotions = sequelize.define(
      'mst_promotions',
      {
         id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            //  defaultValue: Sequelize.INTEGER,

            autoIncrement: true,
         },
         promotion_name: {
            type: Sequelize.INTEGER,
         },
         restaurant_id: {
            type: Sequelize.INTEGER,
         },
      },
      config
   )
   promotions.associate = model => {

      promotions.belongsTo(model.restaurant, { foreignKey: 'restaurant_id', targetKey: 'restaurant_id', sourceKey: 'restaurant_id' })
   }

   return promotions
}
