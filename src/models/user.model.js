module.exports = (sequelize, Sequelize, config) => {
  const RegisterUser = sequelize.define(
    "mst_user",
    {
      iUserId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        // defaultValue: Sequelize.INTEGER,
        autoIncrement: true,
      },
      vName: {
        type: Sequelize.STRING,
      },
      vLastName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      vPhone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      vEmail: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      vImgName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      vFbId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      facebook: {
        type: Sequelize.ENUM("active", "nonactive"),
        allowNull: true,
      },
      google_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      google: {
        type: Sequelize.ENUM("active", "nonactive"),
        allowNull: true,
      },
      apple_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      apple: {
        type: Sequelize.ENUM("active", "nonactive"),
        allowNull: true,
      },
      vOmiseCustId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      New_User: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      cardId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      userId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },

    config
  );

  RegisterUser.associate = (model) => {
    // Relations example
    // Restaurant.belongsTo(model.modelXXX, { foreignKey: 'xxx_id' })
  };

  return RegisterUser;
};
