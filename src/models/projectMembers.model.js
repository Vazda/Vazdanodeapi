import Sequelize from 'sequelize';
module.exports = function(sequelize, DataTypes = Sequelize) {
    return sequelize.define('project_members', {
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
      userId: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      role: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'regular'
      },
      date_inserted: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      }
    },{
        timestamps: false
    }
    );
  };

