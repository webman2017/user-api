module.exports = (sequelize, Sequelize, config) => {
    const Otp = sequelize.define(
        'trx_otp',
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                //  defaultValue: Sequelize.INTEGER,
                autoIncrement: true,
            },
            otp: {
                type: Sequelize.STRING,
            },
            mobile: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            used: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            created_at: {
                type: Sequelize.STRING,
                allowNull: true,
            }
        },
        config,
    )
    Otp.associate = model => {
        // Relations example
        // Restaurant.belongsTo(model.modelXXX, { foreignKey: 'xxx_id' })
    }
    return Otp
}
