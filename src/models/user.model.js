import Sequelize from 'sequelize';
module.exports = function (sequelize, DataTypes = Sequelize) {
  const User = sequelize.define('users', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    salt: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    userStatus: {
      type: DataTypes.ENUM('Y', 'N'),
      allowNull: false,
      defaultValue: 'N'
    },
    tokenCode: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    jobTitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: 'Not set'
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'User'
    }
  }, {
    timestamps: true
  });

  User.prototype.removeSensitiveData = function () {
    this.userPass = undefined;
    this.salt = undefined;
    return this;
  }
  return User;
};
