// import puppeteer from 'puppeteer';
const puppeteer =require('puppeteer')
const Cookies = require('../models/cookies')
const Users = require('../models/user')


const LAUNCH_PUPPETEER_OPTS = {
//  headless: false,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
    '--window-size=1920x1080'
  ]
};

const PAGE_PUPPETEER_OPTS = {
  networkIdle2Timeout: 5000,
  waitUntil: 'networkidle2',
  timeout: 3000000
};

class PuppeteerHandler {
  constructor(options) {
    this.browser = null;
    this.idf=options.idf
  }
  async initBrowser() {
    this.browser = await puppeteer.launch(LAUNCH_PUPPETEER_OPTS);
  }
  async initPage() {
    this.page = await this.browser.newPage();
    await this.page.setViewport({width: 1920, height: 1080})
    const cookies = await Cookies.findOne({raw:true, where: { site:'nc',idf:this.idf }, attributes: ['cookies']}) 
    if (cookies){await this.page.setCookie(...JSON.parse(cookies.cookies));}
  }
  close() {
    this.browser.close();
  }
  async goto(url) {
    url=`https://www.1st-social.com/${url}`
    if (!this.browser) {
      await this.initBrowser();
    }
    if (!this.page) {
      await this.initPage();
    }
    try {
      let ret = await this.page.goto(url, PAGE_PUPPETEER_OPTS);
      if(await this.page.evaluate(() => {return document.querySelector("input[type='password']")!==null})){
        console.log('login...')
        const user = await Users.findOne({raw:true, attributes: ['nc_id','last_name','first_name','nc_pass'], where: {nc_id:this.idf}} ) 
        await this.page.type('input.no[name=ID]',user.nc_id.toString());
        await this.page.type('input.no[name=Password]',user.nc_pass.toString());
        await this.page.click('input.no[type=submit]')  
        // await this.page.waitForSelector('.DataDiv')
        // ret = await this.page.goto(url,PAGE_PUPPETEER_OPTS)
        console.log(JSON.stringify(await this.page.cookies()))
        await Cookies.bulkCreate([{site:'nc',idf:this.idf,cookies: JSON.stringify(await this.page.cookies())}],  { updateOnDuplicate:['cookies','updatedAt']})
      }
      return ret
    } catch (err) {
      throw err;
    }
  }
}
module.exports = PuppeteerHandler