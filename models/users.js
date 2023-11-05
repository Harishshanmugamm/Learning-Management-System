'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    static edsignupuser({ fn, ln, em, pass }) {
      return this.create({
        firstName: fn,
        lastName: ln,
        email: em,
        password: pass,
        roles: 'educator'
      });
    }
  
  }
  Users.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    roles: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'student',
      validate: {
        isIn: [['student', 'educator']]
      }
    }
  }, {
    sequelize,
    modelName: 'Users',
  });
  return Users;
};