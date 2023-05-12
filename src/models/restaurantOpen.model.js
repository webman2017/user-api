module.exports = (sequelize, Sequelize, config) => {
    const restaurantOpen = sequelize.define(
        'restaurant_open',
        {
            open_status: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                // defaultValue: Sequelize.INTEGER,
                autoIncrement: true,

            },
            status_label_th: {
                type: Sequelize.STRING,
            },
            status_label_en: {
                type: Sequelize.STRING,
            },
            estatus: {
                type: Sequelize.STRING,
            },
        },
        config,
    )
    restaurantOpen.associate = model => {
        // Relations example
        // restaurantOpen.hasOne(model.Restaurant, { foreignKey: 'open_status', sourceKey: 'open_status', targetKey: 'open_status' })
        restaurantOpen.hasOne(model.restaurant, { foreignKey: 'open_status', targetKey: 'open_status', sourceKey: 'open_status' })
        // restaurantOpen.hasMany(model.Restaurant, { foreignKey: 'food_type' })
    }
    return restaurantOpen
}
