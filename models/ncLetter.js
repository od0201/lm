// MySQL
const Sequelize = require('sequelize')
const sequelize = require('../utils/database')


const ncLetter = sequelize.define('nc_letter', {
  id: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
    primaryKey: true
  },
  idf: {
    type: Sequelize.INTEGER(11),
    allowNull: false
  },
  idm: {
    type: Sequelize.INTEGER(11),
    allowNull: false
  },
  route: { //(1)man=>woman, (2)woman=>man
    type: Sequelize.INTEGER(1),
    allowNull: false
  },
  status: { //from man (1)новое письмо, (2)открытое
    type: Sequelize.INTEGER(1),
  },
  type: { //from woman (1)презентация, (2)-сигнальное, (3)-отозванное (или 10 ???)
    type: Sequelize.INTEGER(1),
  },
  manager: { //idt отправившего письмо и кому будут начисленны деньги
    type: Sequelize.INTEGER(11),
  },
  date: {
    type: Sequelize.DATE,
    allowNull: false,
 //   defaultValue: Sequelize.NOW
  },
  text: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  //menager credit date
}, {
  timestamps: false
});

module.exports = ncLetter