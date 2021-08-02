// MySQL
const Sequelize = require('sequelize')
const sequelize = require('../utils/database')


const users = sequelize.define('users', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },  
  nick:{
    type: Sequelize.STRING(30),
    allowNull: false
  },

  email:{
    type: Sequelize.STRING(40), 
    allowNull: false,
    unique: true   
  },
  nc_id: {
    type: Sequelize.INTEGER(10),
  },  
  nc_pass: {
    type: Sequelize.STRING(20),
  },
  first_name: {
    type: Sequelize.STRING(30),
  },    
  last_name: {
    type: Sequelize.STRING(30),
  },  
  avatarUrl:{
    type: Sequelize.STRING(100),    
  },
  pswCrypt:{
    type: Sequelize.STRING(60),    
  },
  resetToken: {
    type: Sequelize.STRING(60),
  },  
  resetTokenExp: {
    type: Sequelize.DATE    
  },  
}, {
  timestamps: false
});

module.exports = users
