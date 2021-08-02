// MySQL
const Sequelize = require('sequelize')
const sequelize = require('../utils/database')


const cookies = sequelize.define('Cookies', {
  site: {
    type: Sequelize.STRING(2),
    allowNull: false
  },
  idf: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  cookies: {
    type: Sequelize.TEXT,
    allowNull: false
  },
},{
  uniqueKeys: {
    site_idf: {
        fields: ['site', 'idf']
    }
  }
})

module.exports = cookies
