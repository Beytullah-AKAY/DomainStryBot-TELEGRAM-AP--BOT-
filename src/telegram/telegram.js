    const {Markup}=require("telegraf")
    const SendEmail=require("../SendEmail/SendEmail")
    const database = require("../utils/database");
    const {SendCommandButtons,SendRegisterButtons}=require("./sendCommandButtons")
    const bot=require("../TELEGRAM BOT CONNECTION/BotConnection")
    const DbUserSave=require("./DbUserSave")

    const Telegram = async() => {
        let i=0
            let messageHistory = {};
            let waitingForCommand={}

            bot.start((ctx) => {
               
                 ctx.reply("DomainSentryBOT ile domain adreslerinizin Durumlarını anlık kontrol etmek isterseniz.Mail adresinizi giriniz:")
                
            });
           
            bot.on('message', async (ctx) => {
              try {
                let users=await database.user.findMany()

                const keyboard = Markup.inlineKeyboard([
                    Markup.button.callback('Mail Gönder', `send_${i}`)
                  ]);
                 const user=users.find(user=>Number(user.chatid)===ctx.chat.id)
                const chatId = Number(ctx.chat.id);
                const messageText=ctx.text

                if (!user) {

                    if (messageText.includes("@")) {

                        try {
                            await DbUserSave(ctx);
                            await SendCommandButtons(ctx,chatId);
                        } catch (error) {
                            console.error('DbUserSave fonksiyonunda hata oluştu:', error);
                           
                        }
                    } else {
                        await SendRegisterButtons(ctx,chatId);
                    }
                } else {
                   await SendCommandButtons(ctx,chatId);
                }
//burdan

                if (messageText === 'Domain EKLE' || messageText === 'Domain SİL' || messageText === 'Domain LİSTELE') {
                  waitingForCommand[chatId] = messageText;
             if (messageText === "Domain EKLE") {
                  ctx.reply(`Lütfen eklemek istediğiniz Domain adresini giriniz. (örnek: example.com)`);
                   } else if (messageText === "Domain SİL") {
                ctx.reply(`Lütfen silmek istediğiniz Domain adresini giriniz. (örnek: example.com)`);
             } else if (messageText === "Domain LİSTELE") {
              try {
                   var DomainsList = await database.domain.findMany({
                      where: {
                    chatid: chatId
                }
                   });
               if (!DomainsList) {
                ctx.reply(`Kayıtlı bir Domain adresiniz bulunamadı`);
               } else {
                let DomainNames = ""
                DomainsList.forEach(eleman => {
                    DomainNames += `${eleman.name}\n`
                })
                ctx.reply(`Domain adresleriniz\n ${DomainNames}`,keyboard);
                messageHistory[i] = `${DomainNames}`; 
                i++
                     }
                 } catch (error) {
                 console.error('Domain listeleme işleminde hata oluştu:', error);
                 ctx.reply('Domain listelerken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
                      }
                }
                    }
                else{
                    const waitingCommand = waitingForCommand[chatId];
                    if (waitingCommand) {
                        switch (waitingCommand) {
                            case 'Domain EKLE':
                                if (messageText.includes(".com")) {
                                    try {
                                        const DomainControl = await database.domain.findFirst({
                                            where: {
                                                chatid:chatId,
                                                name: messageText
                                            }
                                        })
    
                                        if (!DomainControl) {
                                            await database.domain.create({
                                                data: {
                                                    chatid: chatId,
                                                    name: messageText,
                                                    
                                                }
                                            })
                                            ctx.reply(`Domain adresi ${messageText} başarıyla eklendi `,keyboard);
                                            messageHistory[i] = `${messageText}`; 
                                            i++
                                        }else{
                                            ctx.reply(`Domain adresi zaten kayıtlı : ${messageText}`);
                                        }
                                    } catch (error) {
                                     console.log(error)   
                                    }
                                  

                                } else {
                                    ctx.reply(`Geçersiz domain adresi: ${messageText}`,keyboard);
                                    messageHistory[i] = `${messageText}`; 
                                    i++
                                }
                                break;
                                case 'Domain SİL':
                                    if (messageText.includes(".com")) {
                                      try {
                                        const DeleteDomain = await database.Domain.findFirst({
                                          where: {
                                            name: messageText,
                                            chatid: chatId 
                                          }
                                        });
                                  
                                        if (DeleteDomain) {
                                          // DomainStatusCode tablosundan sil
                                          await database.DomainStatusCode.deleteMany({
                                            where: {
                                              domainId: DeleteDomain.id
                                            }
                                          });
                                  
                                          // Domain tablosundan sil
                                          await database.Domain.delete({
                                            where: {
                                              id: DeleteDomain.id
                                            }
                                          });
                                        ctx.reply(`Domain başarıyla silindi: ${messageText}`,keyboard);
                                        messageHistory[i] = `${messageText}`; 
                                            i++
                                        console.log("Domain başarıyla silindi.");
                                    } else {
                                        ctx.reply(`Silinecek Domain bulunamadı: ${messageText}`);

                                        console.log("Silinmek istenen domain bulunamadı.");
                                    }
                                   } catch (error) {
                                    console.log(error)   
                                   }
                                } else {
                                    ctx.reply(`Geçersiz domain adresi: ${messageText}`);
                                }
                                break;
                                case 'Domain LİSTELE':
                               
                                break;

                        }
                        delete waitingForCommand[chatId];
                    }
                    else {
                        
                    }
                
            
                }} catch (error) {
                console.log(error)
                }
               
    
        })
        bot.action(/send_(.+)/, async (ctx) => {
            const messageId = ctx.match[1];
            const message = messageHistory[messageId];
          
            if (message) {
            
              console.log(`E-posta gönderiliyor: ${message}`);
              await SendEmail(message,ctx)
              await ctx.reply('Mesaj e-posta ile gönderildi!'); 
            } else {
              await ctx.reply('Mesaj bulunamadı!');
            }
          });
        bot.launch()

    }
    module.exports = { Telegram };
    

