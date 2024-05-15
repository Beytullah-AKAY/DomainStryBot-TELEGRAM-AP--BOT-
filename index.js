const {Telegram} = require("./src/telegram/telegram")
require('dotenv').config();
const ForwardingErroneousRequests=require("./src/DBDomainControl/ForwardingErroneousRequests")
const DomainAxiosRequestsWithBullMQ=require("./src/DBDomainControl/DomainAxiosRequestsWithBullMQ")
const express=require("./src/express/app")
const cron=require("cron")

const cronJob15 = new cron.CronJob('0 */15 8-22,23 * * *', async () => {
 await DomainAxiosRequestsWithBullMQ()
  },null,true,'Europe/Istanbul')
 
 cronJob15.start()

 const cronJob30 = new cron.CronJob('0 */30 0-7,23 * * *', async () => {
  await DomainAxiosRequestsWithBullMQ()
},null,true,'Europe/Istanbul')

cronJob30.start()




const başla=async()=>{
  await express()
  await  Telegram()

  await ForwardingErroneousRequests()

}


başla().then(()=>{
    DomainAxiosRequestsWithBullMQ()

})


