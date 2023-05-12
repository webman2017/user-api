module.exports = (sequelize, Sequelize, config) => {
    const bannerRestaurant = sequelize.define(
        'mst_advertise_banners_restaurant',
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
            banner_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
        },
        config
    )

    bannerRestaurant.associate = model => {
        // Relations example
        bannerRestaurant.hasOne(model.banner, { foreignKey: 'iAdvertBannerId' })
        bannerRestaurant.belongsTo(model.restaurant, { foreignKey: 'restaurant_id', targetKey: 'restaurant_id' })
    }

    return bannerRestaurant
}
