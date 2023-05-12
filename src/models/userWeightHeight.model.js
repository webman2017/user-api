module.exports = (sequelize, Sequelize, config) => {
    const userWeightHeight = sequelize.define(
        'user_weight_height',
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                // defaultValue: Sequelize.INTEGER,
                autoIncrement: true,
            },
            weight: {
                type: Sequelize.STRING,
            },
            height: {
                type: Sequelize.STRING,
            },
            user_id: {
                type: Sequelize.INTEGER,
            },
            created_at: {
                type: 'TIMESTAMP',
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                allowNull: false
            },
        },
        config,
    )
    userWeightHeight.associate = model => {
        // Relations example

        // activities.belongsTo(model.orders, { foreignKey: 'orders_id', targetKey: 'iCabRequestId' })
    }
    return userWeightHeight
}
