const {Router} = require('express')
const auth = require('../../middleware/auth')
const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')
const router = Router()

router.get('/', auth, async (req, res) => {
  try {
    const SQL=`SELECT nc_new_letters.no, nc_new_letters.datetime, nc_new_letters.idf, nc_new_letters.idm, nc_new_letters.fim,nc_new_letters.msg,nc_new_letters.createdAt,
    CONCAT(users.last_name,' ',users.first_name) fif,
    users.nc_manager1 idt,users.nc_global,
    (SELECT CONCAT(last_name,' ',first_name) FROM users WHERE id=idt limit 1) fit,
    (SELECT max(date) FROM nc_letters WHERE idf= nc_new_letters.idf and idm=nc_new_letters.idm and route=2) max_date,
    IFNULL((SELECT contact_status2 FROM nc_female_male WHERE female=nc_new_letters.idf and male=nc_new_letters.idm LIMIT 1), 0) contact_status2,  (SELECT FROM_UNIXTIME(max(time)) FROM session WHERE user=idt) time_session
     FROM nc_new_letters LEFT JOIN users ON nc_new_letters.idf=users.nc_ID WHERE users.nc_manager1!=1000100121
    ORDER BY fit, nc_new_letters.datetime`
    let table = await sequelize.query(SQL,{ type:Sequelize.QueryTypes.SELECT}) 
    table=table.filter(a=>a.datetime > a.max_date)
    table.forEach(function(a,i){
      a.idt_previous=(i!==0)?table[i-1].idt:0 //добавляем idt_previous для создание заголовков новой переводчицы
      a.isOld=(Date.parse(Date())-Date.parse(a.datetime))/86400000>0.5?true:false   
    }) 
  
  
    res.render('_ncNewLetters', {
      title: 'nc New Letters',
      isNcNewLetters: true,
      table
    })
  } catch (e) {
    console.log(e)
  }
})
module.exports = router