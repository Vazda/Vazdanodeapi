import Sequelize from 'sequelize';
module.exports = function (sequelize, DataTypes = Sequelize) {
  const Project = sequelize.define('projects', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    projectName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
  }, {
    timestamps: true
  });

  
  return Project;
};
