module.exports = (sequelize, Sequelize, config) => {
    const Shortcut = sequelize.define(
        'mst_shortcut',
        {
            shortcut_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                // defaultValue: Sequelize.INTEGER,
                autoIncrement: true,
            },
            shortcut_title: {
                type: Sequelize.STRING,
            },
            status: {
                type: Sequelize.INTEGER,
            },

        },
        config
    )

    Shortcut.associate = model => {
        // Relations example
        // Banner.belongsTo(model.bannerRestaurant, { foreignKey: 'iAdvertBannerId', targetKey: 'banner_id' })
    }

    return Shortcut
}
