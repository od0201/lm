const Sequelize = require('sequelize')
const keys = require('../keys')


const sequelize = new Sequelize(keys.MYSQL_NAME, keys.MYSQL_USER, keys.MYSQL_PASSWORD, {
  host: keys.MYSQL_HOST,
  dialect: 'mysql',
  //define: {timestamps: false} // если хотим чтоб не создавались createdAt и updatedAt
})

module.exports = sequelize