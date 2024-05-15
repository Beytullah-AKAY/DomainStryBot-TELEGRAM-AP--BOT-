
const nodemailer =require("nodemailer")
const database =require('../utils/database')
const bot = require('../TELEGRAM BOT CONNECTION/BotConnection');

const SendEmail=async(message,ctx)=>{
      
    
    // SMTP ayarları
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // Use `true` for port 465, `false` for all other ports
        auth: {
          user: 'larkvinanemo@gmail.com',
          pass: process.env.EMAIL_KEY,
        },
      });

    //console.log(message,ctx)
        const Domains= await database.domain.findMany({
            where:{chatid:Number(ctx.chat.id)
            }
        })
        const mailAdress=await database.user.findFirst({
            where:{
                chatid:Number(ctx.chat.id)
            }
        })
        let DomainSend=""
        Domains.forEach(eleman=>{
            DomainSend += `${eleman.name}\n`
        })

        sendMail(mailAdress.email, 'Domain Adresleri', `${message}`);
        //ctx.reply(`Domain adresleri Email adresine gönderildi.`)

        //console.log(Domains,mailAdress)
    
 



    // Mail gönderme fonksiyonu
    async function sendMail(to, subject, text) {
        try {
            // Mail bilgileri
            const mailOptions = {
                from: 'larkvinanemo@gmail.com',
                to: to,
                subject: subject,
                text: text
            };
    
            // Maili gönder
            await transporter.sendMail(mailOptions);
            console.log('Mail gönderildi:', subject);
        } catch (error) {
            console.error('Mail gönderirken hata oluştu:', error);
        }
    }
    
    


}
module.exports=SendEmail