module.exports = (sequelize, Sequelize, config) => {
    const log = sequelize.define(
        'driver_log_report',
        {
            iDriverLogId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                // defaultValue: Sequelize.INTEGER,
                autoIncrement: true,
            },
            iDriverId: {
                type: Sequelize.INTEGER,
            },
            dLoginDateTime: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            dLogoutDateTime: {
                type: Sequelize.STRING,
                allowNull: false,
            },

        },
        config,
    )
    log.associate = model => {
        // Relations example
        // Restaurant.belongsTo(model.modelXXX, { foreignKey: 'xxx_id' })
    }
    return log
}
