module.exports = (sequelize, Sequelize, config) => {
  const UserFaveAddress = sequelize.define(
    "trx_saveplace",
    {
      iUserFavAddressId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        // defaultValue: Sequelize.INTEGER,
        autoIncrement: true,
      },
      iUserId: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      eUserType: {
        type: Sequelize.STRING,

      },
      vAddress: {
        type: Sequelize.TEXT,

      },
      vLatitude: {
        type: Sequelize.TEXT,

      },
      vLongitude: {
        type: Sequelize.TEXT,

      },
      name: {
        type: Sequelize.TEXT,

      },
      address_detail: {
        type: Sequelize.TEXT,

      },
      contact_name: {
        type: Sequelize.TEXT,

      },
      contact_number: {
        type: Sequelize.TEXT,

      },
      note_to_driver: {
        type: Sequelize.TEXT,

      },
      eType: {
        type: Sequelize.ENUM("Home", "Work", "Other"),

      },
    },
    config
  );

  UserFaveAddress.associate = (model) => {
    // Relations example
    // Restaurant.belongsTo(model.modelXXX, { foreignKey: 'xxx_id' })
  };
  return UserFaveAddress;
};
