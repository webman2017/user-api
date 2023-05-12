module.exports = (sequelize, Sequelize, config) => {
    const deliverySave = sequelize.define(
        'trx_delivery',
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                // defaultValue: Sequelize.INTEGER,
                autoIncrement: true,
            },
            deliveryPrice: {
                type: Sequelize.STRING,
            },
            dateTime: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            status: {
                type: Sequelize.STRING,
            },
            iCabRequestId: {
                type: Sequelize.STRING,
                allowNull: true,
            }

        },
        config,
    )
    deliverySave.associate = model => {
        // Relations example
        deliverySave.belongsTo(model.deliverySaveDetail, { foreignKey: 'id', targetKey: 'delivery_id' })
        // foodType.belongsTo(model.restaurantMenu, { foreignKey: 'id' })
    }
    return deliverySave
}