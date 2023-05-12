module.exports = (sequelize, Sequelize, config) => {
    const countWalk = sequelize.define(
        'count_walk',
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                // defaultValue: Sequelize.INTEGER,
                autoIncrement: true,
            },
            cal: {
                type: Sequelize.STRING,
            },
            distance: {
                type: Sequelize.STRING,
            },
            step: {
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
    countWalk.associate = model => {
        // Relations example

        // activities.belongsTo(model.orders, { foreignKey: 'orders_id', targetKey: 'iCabRequestId' })
    }
    return countWalk
}
