module.exports = (sequelize, Sequelize, config) => {
    const faqs = sequelize.define(
        'faqs',
        {
            iFaqId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                // defaultValue: Sequelize.INTEGER,
                autoIncrement: true,
            },
            vTitle_TH: {
                type: Sequelize.STRING,
            },
            tAnswer_TH: {
                type: Sequelize.STRING,
            },
            eStatus: {
                type: Sequelize.STRING,
            },
        },
        config,
    )
    faqs.associate = model => {
        // Relations example

        // activities.belongsTo(model.orders, { foreignKey: 'orders_id', targetKey: 'iCabRequestId' })
    }
    return faqs
}
