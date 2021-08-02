// MySQL
const Sequelize = require('sequelize')
const sequelize = require('../utils/database')


const ncMales = sequelize.define('nc_male', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: false,
    allowNull: false,
    primaryKey: true
  },  
  nick:{
    type: Sequelize.STRING(30),
  },
  name:{
    type: Sequelize.STRING(60),
  },
  yo:{
    type: Sequelize.INTEGER(3),
  },
  country:{
    type: Sequelize.STRING(30),
  },
  photo:{
    type: Sequelize.STRING(35),
  },

},{
timestamps: false,
freezeTableName: true,
})
module.exports = ncMales