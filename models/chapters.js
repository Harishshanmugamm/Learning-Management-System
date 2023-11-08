'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chapters extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Chapters.belongsTo(models.Courses, {
        foreignKey: "courseId",
      });
      Chapters.hasMany(models.Pages, {
        foreignKey: "chapterId",
      });
    }
    static addChapter({ title, description, courseId }) {
      return this.create({ title, description, courseId});
    }
  }
  Chapters.init({
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    courseId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Chapters',
    tableName: 'Chapters',
  });
  return Chapters;
};
