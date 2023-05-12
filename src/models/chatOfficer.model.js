module.exports = (sequelize, Sequelize, config) => {
    const chatOfficer = sequelize.define(
        'chat_officer',
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                // defaultValue: Sequelize.INTEGER,
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
            // created_at: {
            //     type: Sequelize.STRING,
            //     allowNull: false,
            // }
        },
        config,
    )
    chatOfficer.associate = model => {
        // Relations example
        // Restaurant.belongsTo(model.modelXXX, { foreignKey: 'xxx_id' })
    }
    return chatOfficer
}
