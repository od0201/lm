const {Router} = require('express')
const auth = require('../../middleware/auth')
const puppeteer =require('puppeteer')
const PuppeteerHandler =require ('../../utils/puppeteer')
const cherio =require ('cherio');
const Sequelize = require('sequelize')
const sequelize = require('../../utils/database')
const Users = require('../../models/user')
const NcMales = require('../../models/nc_male')
const NcLetter = require('../../models/ncLetter')
const router = Router()


//    http://localhost:3000/nc/correspondence?idf=1001699847&idm=1001191618&msg=781436487

router.all('/', auth, async (req, res) => {
  let arrayOfErrors=[],arrayOfWarnings=[];
  let idf,idm,message
  switch(req.method) {
    case 'GET':
      idf=+req.query.idf
      idm=+req.query.idm
      break
    case 'POST':
      idf=+req.body.idf
      idm=+req.body.idm
      message=req.body.message
      break
    default:
      arrayOfErrors.push('method not GET or POST')      
      break
  }
  let isTextarea=true

  if (!idf>0 || !idm>0){    
    arrayOfErrors.push('male or female ID not set')
  }
  const user = await Users.findOne({ where: {nc_id:idf}})
  let ncMales = await NcMales.findOne({ where: {id:idm}})
  if(!ncMales){
    ncMales = new NcMales({id:idm})
    await ncMales.save()
    // здесь нужно запрос к странице пользователя и заполнить БД !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  }
  let p=new PuppeteerHandler({idf})
  if(req.query.nun){
    arrayOfErrors.push({text:'NC не обновлялась'})
    ncLetters = await NcLetter.findAll({raw:true, attributes: ['id'],order: [['date','DESC']],limit: 30, where: {idf,idm}} )
  }
  if(!arrayOfErrors.length){
    try {
      let url=`msg.writer.php?ID=${idm}`
      await p.goto(url);
      await p.page.waitForSelector('div.emojionearea-editor')
      if (req.method==='POST'){      
        message=message.replace(/\r\n/g,'\n')               
        console.log(message)    
        await p.page.type('div.emojionearea-editor',message);
        //await p.page.$eval('div.emojionearea-editor', `el => el.textContent = '${message}'`);
        //await p.page.evaluate(`(async() => {document.querySelector('div.emojionearea-editor').innerHTML = '${message}';})()`);
        console.log('insert')
        await p.page.waitForTimeout(1500);
        await p.page.click('button#send')  
        await p.page.waitForTimeout(500);
        await p.page.waitForSelector('div.emojionearea-editor')
        // await new Promise(function(resolve) {setTimeout(resolve, 500)});
        // await p.page.screenshot({path: './images/google.png'});    
        console.log('send')
      }
      await p.page.waitForTimeout(500);
      let $ = cherio.load(await p.page.content());
      ncLetters = await NcLetter.findAll({raw:true, attributes: ['id'],order: [['date','DESC']],limit: 30, where: {idf,idm}} )
      let msgs=[]
      const statusBar = $("statusbar").text()
      if (statusBar===""){
        $("message").each(async (i,e)=>{
          let id=+$(e).attr('id').replace(/^./,'')
          let [route,status]=$(e).attr('class').split(' ')
          route=(route==='in')?1:2
          status=(status==='new')?1:2
          let date=$(e).attr('t')*1000
          let text=$(e).find('p.text').html().replace(/^.*?(<br>)/,'')
          msgs.push({id,route,status,date,text})
          console.log(id)
        })
        for (e of msgs){
          let {id,route,status,date,text} = e
          if(!ncLetters.find(el=>el.id===e.id)){
            console.log((new Date()-date)/(60*1000))
            manager=(route===2 && ((new Date()-date)/(60*1000))<2)?req.user.id:0 // <2 минут
            const newNcLetter = new NcLetter({ id,idf,idm,route,status,text,date,manager})
            await newNcLetter.save()
          }
        }
        // обновляем фото
        let yo
        [ncMales.name,yo,ncMales.country]=$("usersinfo [style=''] small").text().match(/^(.*?), (\d+) y.o, (.*?, .*?)$/).splice(1)
        ncMales.yo=Number(yo)
        ncMales.photo=$("userinfo img").attr('src').replace('-10-','-0-').replace(/^.*?com.(.*?).jpg/,'$1')
        console.log(ncMales.name,ncMales.yo,ncMales.country,ncMales.photo)
        await ncMales.save()     
      }else{
        arrayOfWarnings.push(statusBar)
      }

      p.close();  
    } catch (e) {
      console.log(e)
      arrayOfErrors.push({text:e})
    }
  }
  let SQL=`SELECT id, idf, idm, route, date, text,
  (SELECT CONCAT(last_name,' ',first_name) FROM users WHERE id=nc_letters.manager limit 1) fit
  FROM nc_letters WHERE idf=${idf} and idm=${idm} ORDER BY date DESC LIMIT 30`
  ncLetters = await sequelize.query(SQL,{ type:Sequelize.QueryTypes.SELECT})
  ncLetters=ncLetters.reverse() 

  if (!ncMales.name) {ncMales.name='<no name>'}
  res.render('_ncCorrespondence', {
    url:req.originalUrl,
    title: 'nc Correspondence',
    idf,
    idm,
    fif:user.last_name+' '+user.first_name,
    ncMales,
    photo_m:'https://photo.cdn.1st-social.com/'+((ncMales.photo)?`${ncMales.photo}.jpg`:'man.svg'),
    isTextarea,
    ncLetters,
    arrayOfErrors,
    arrayOfWarnings

  })
})
module.exports = router