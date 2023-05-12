module.exports = (sequelize, Sequelize, config) => {
    const orderRequest = sequelize.define(
        'cab_request_now',
        {
            iCabRequestId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                defaultValue: Sequelize.INTEGER,
                autoIncrement: true,
            },
            iUserld: {
                type: Sequelize.INTEGER,
            },
            iTripId: {
                type: Sequelize.INTEGER,
            },
            vSourceLatitude: {
                type: Sequelize.STRING,
            },
            vSourceLongitude: {
                type: Sequelize.STRING,
            },
            tSourceAddress: {
                type: Sequelize.STRING,
            },

            vDestLatitude: {
                type: Sequelize.STRING,
            },
            vDestLongitude: {
                type: Sequelize.STRING,
            },
            tDestAddress: {
                type: Sequelize.STRING,
            },
        },
        config,
    )
    orderRequest.associate = model => {
        // Relations example
        // foodType.belongsTo(model.restaurantMenu, { foreignKey: 'id' })
    }
    return orderRequest
}
