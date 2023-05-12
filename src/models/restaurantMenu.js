module.exports = (sequelize, Sequelize, config) => {
    const restaurantMenu = sequelize.define(
        'restaurant_menu',
        {
            restaurant_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                // defaultValue: Sequelize.INTEGER,
                autoIncrement: true,

            },
            menu_name: {
                type: Sequelize.STRING,
            },
            menu_id: {
                type: Sequelize.INTEGER,
            },
            food_type: {
                type: Sequelize.INTEGER,
            },

        },
        config,
    )
    restaurantMenu.associate = model => {
        // Relations example
        // Restaurant.belongsTo(model.Restaurant, { foreignKey: 'food_type' })
    }
    return restaurantMenu
}
