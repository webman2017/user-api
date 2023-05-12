module.exports = (sequelize, Sequelize, config) => {
    const delivery = sequelize.define(
        'vehicle_type',
        {
            iVehicleTypeId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                // defaultValue: Sequelize.INTEGER,
                autoIncrement: true,
            },
            vVehicleType: {
                type: Sequelize.STRING,
            },
            vVehicleType_EN: {
                type: Sequelize.STRING,
            },
            vVehicleType_TH: {
                type: Sequelize.STRING,
            },
            StartMinKM: {
                type: Sequelize.STRING,
            },
            PricePerKM: {
                type: Sequelize.STRING,
            },
            BasePriceMin: {
                type: Sequelize.STRING,
            }
        },
        config,
    )
    delivery.associate = model => {
        // Relations example
        // foodType.belongsTo(model.restaurantMenu, { foreignKey: 'id' })
    }
    return delivery
}
