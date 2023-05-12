module.exports = (sequelize, Sequelize, config) => {
    const max = sequelize.define(
        'max_count',
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                // defaultValue: Sequelize.INTEGER,
                autoIncrement: true,
            },
            max: {
                type: Sequelize.INTEGER,
            },
        },
        config,
    )
    max.associate = model => {
        // Relations example
        // orders.belongsTo(model.orderDetails, { foreignKey: 'order_id' })
        // orders.belongsTo(model.restaurant, { foreignKey: 'restaurant_id', targetKey: 'restaurant_id' })
    }
    return max
}
