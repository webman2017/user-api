module.exports = (sequelize, Sequelize, config) => {
    const location = sequelize.define(
        'location_master',
        {
            iLocationId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                // defaultValue: Sequelize.INTEGER,
                autoIncrement: true,

            },
            iCountryId: {
                type: Sequelize.INTEGER,
            },
            vLocationName: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            tLatitude: {
                type: Sequelize.STRING,
                allowNull: true,
            },


            tLongitude: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            eStatus: {
                type: Sequelize.STRING,
            },
            eFor: {
                type: Sequelize.STRING,
            },

        },
        config,
    )
    location.associate = model => {
        // Relations example
        // orders.belongsTo(model.orderDetails, { foreignKey: 'order_id' })
        // orders.belongsTo(model.restaurant, { foreignKey: 'restaurant_id', targetKey: 'restaurant_id' })
    }
    return location
}
