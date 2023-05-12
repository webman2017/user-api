module.exports = (sequelize, Sequelize, config) => {
    const chat = sequelize.define(
        'chat',
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                //  defaultValue: Sequelize.INTEGER,
                autoIncrement: true,
            },
            sender: {
                type: Sequelize.STRING,
            },
            receiver: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            message: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            create_at: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            order_id: {
                type: Sequelize.STRING,
                allowNull: false,
            }



        },
        config,
    )
    chat.associate = model => {
        // Relations example
        // Restaurant.belongsTo(model.modelXXX, { foreignKey: 'xxx_id' })
    }
    return chat
}
