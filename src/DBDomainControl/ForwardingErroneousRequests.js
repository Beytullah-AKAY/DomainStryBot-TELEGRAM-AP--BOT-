const database=require("../utils/database")
const axios=require("axios")
const bot=require("../TELEGRAM BOT CONNECTION/BotConnection")
const {Markup}=require("telegraf")
const SendEmail=require("../SendEmail/SendEmail")


async function ForwardingErroneousRequests() {
  
    await fetchEveryMinuteForDomainsWithStatusOver400().then(()=>{
      console.log("başladık")
    })
  
}
setInterval(async () => {
 
  await fetchEveryMinuteForDomainsWithStatusOver400();
}, 60000); 


// Belirli bir domain için GET isteği yap
async function fetchDomain(domain) {

  try {
    
    const response = await axios.get(`http://${domain.name}`);

   await saveStatus(domain, response.status);
  } catch (error) {
    if(error.message.includes("Request failed")){
        await saveStatus(domain, 400);
    }else if(error.message.includes("ENOTFOUND")){
        await saveStatus(domain, 403);
    }else{
        await saveStatus(domain, 450);

    }
    
  }
}

async function saveStatus(domain, statusCode) {
  try {
    const DomainControl=await database.domain.findFirst({
      where:{name:domain.name}
    })
    if(DomainControl){
      await database.DomainStatusCode.create({
        data: {
          domainId:domain.id,
          statusCode:statusCode,
          timestamp:new Date()
        },
      });
    }else{
      console.log("domain silindi")
    }
  } catch (error) {
    console.log(error)
  }
}


let DomainForFeedbackArray = []; // Domain güncelleme 
let FeedbackMessageArray = []; // Mevcut domain listesi
let DeleteDomain = [];
let DomainsArray=[]
let messageHistoryy = {},i
  let newDomains
  
async function fetchEveryMinuteForDomainsWithStatusOver400() {
  
  const keyboard = Markup.inlineKeyboard([
    Markup.button.callback('Mail Gönder', `send_${i}`)
  ]);


   
    
         newDomains = await database.Domain.findMany({
            where: {
                statusCodes: {
                    every: {
                        statusCode: {
                            gt: 399 // 400'den büyük 
                        }
                    }
                }
            }
        });
        console.log(newDomains,"newDomains")
        if(newDomains){

        
          for (const domain of newDomains) {
            try {
              const domainId = domain.id;
              console.log(domainId)
              
                const DomainForFeedback = await database.DomainStatusCode.findFirst({
                  where:{
                    domainId:domainId
                  },
                  orderBy:{
                    timestamp:"desc"
                  }
                })
                
                DomainForFeedback.chatid=domain.chatid
                DomainForFeedback.name=domain.name
  
                  DomainsArray.push(DomainForFeedback);
            } catch (error) {
              console.log(error)
            }
             
              }




              try {
                // silinecek diziyi oluşturma
                DeleteDomain = DomainForFeedbackArray.filter(item1 => 
                  !DomainsArray.some(item2 => item1.domainId === item2.domainId && item1.name === item2.name)
                );    
              
                
             
              
              
                if (DeleteDomain.length > 0) {
                  console.log("DeleteDomain boş değil, mesaj atma işlemi başlıyor...");
                  
                  for (let eleman of DeleteDomain){
                    const time = await GetTime(eleman.timestamp);
                    console.log("Mesaj atılıyor:", eleman.name, time);
              
                    bot.telegram.sendMessage(Number(eleman.chatid), `${eleman.name} ${time} dk dır kapalıydı şimdi açıldı.`, keyboard);
                    messageHistoryy[i] = `${eleman.name} ${time} dakikadan uzun süredir güncellenmedi.`; 
                    i++;
                  }
              
                  DeleteDomain.forEach(eleman => {
                    const index = DomainForFeedbackArray.findIndex(item => item.id === eleman.id && item.name === eleman.name);
                    if (index !== -1) {
                      DomainForFeedbackArray.splice(index, 1);
                    }
                  });
                }
  
                const eklenenElemanlar = DomainsArray.filter(eleman => 
                  !DomainForFeedbackArray.some(yeniEleman => 
                    yeniEleman.domainId === eleman.domainId && yeniEleman.name === eleman.name 
                  )
                );              
                DomainForFeedbackArray.push(...eklenenElemanlar);
                DomainsArray = []
                console.log(DomainForFeedbackArray.length,"burda"); 

                  if(DomainForFeedbackArray.length>0){
                    for(let eleman of DomainForFeedbackArray){
                      const time=await GetTime(eleman.timestamp)
                      console.log("time",time)
                      if(time&&time>=60){
                        const saat = Math.ceil(time / 60);

                        console.log("Mesaj at");
                        bot.telegram.sendMessage(Number(eleman.chatid),`${eleman.name} ${saat}  kapalıydı şimdi açıldı.`,keyboard)
                        messageHistoryy[i] = `${eleman.name} ${saat} dakikadan uzun süredir güncellenmedi.`; 
                          i++
                      }
                    }
                  }
              } catch (error) {
                console.log(error)
              }

              bot.action(/send_(.+)/, async (ctx) => {
                const messageId = ctx.match[1];
                const message = messageHistoryy[messageId];
              
                if (message) {
                
                  console.log(`E-posta gönderiliyor: ${message}`);
                  await SendEmail(message,ctx)
                  await ctx.reply('Mesaj e-posta ile gönderildi!'); 
                } else {
                  await ctx.reply('Mesaj bulunamadı!');
                }
              });
           
           
            await fetchEveryMinute(newDomains);
        }else{
          console.log("kayıtlı domain adresi yok")
        }
            }
       


            const GetTime=async(timestamp)=>{
              

           
                  const date = new Date(timestamp);

                     
                const now = new Date();

                    
                    const minutesPassed = Math.round((now - date) / (1000 * 60));

                    console.log(`${minutesPassed} dakika geçti.`);
                    return minutesPassed
               }


     

      async function fetchEveryMinute(domains) {
       for (const domain of domains) {
        await fetchDomain(domain);
      }
    }




module.exports=ForwardingErroneousRequests






