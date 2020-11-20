import Sequelize from 'sequelize';
module.exports = function (sequelize, DataTypes = Sequelize) {
  const Widget = sequelize.define('widgets', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    projectId: {
        type: DataTypes.INTEGER(11),
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('COMPLETED', 'RATING', 'URGENCY'),
        allowNull: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    order_number: {
      type: DataTypes.INTEGER(3),
      allowNull: false
    },
    edited: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 0
    }
  }, {
    timestamps: true
  });

  
  return Widget;
};
