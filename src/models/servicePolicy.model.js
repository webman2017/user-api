module.exports = (sequelize, Sequelize, config) => {
    const pages = sequelize.define(
        "mst_pages",
        {
            iPageId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                // defaultValue: Sequelize.INTEGER,
                autoIncrement: true,
            },
            vPageTitle_TH: {
                type: Sequelize.INTEGER,
            },
            tPageDesc_TH: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        },
        config
    );

    pages.associate = (model) => {
        // Relations example
        // Restaurant.belongsTo(model.modelXXX, { foreignKey: 'xxx_id' })
    };
    return pages;
};
