 const bot=require("../TELEGRAM BOT CONNECTION/BotConnection")
const {Markup}=require("telegraf")

 const SendCommandButtons = async (ctx,chatId) => {
    try {
        const keyboard = Markup.keyboard([
            ['Domain EKLE'],
            ['Domain SİL'],
            ['Domain LİSTELE']
        ]).resize(); // Klavyeyi yeniden boyutlandırır

        await ctx.reply("Lütfen bir işlem yapmak için mesaj yazma alanınızın yanında bulunan komut simgesine tıklayıp komut seçiniz", keyboard);
    } catch (error) {
        console.log(error);
    }
};

const SendRegisterButtons = async (ctx,chatId) => {
    try {
        const keyboard = Markup.keyboard([
            ['KAYIT OL']
        ]).resize();

       await ctx.reply("Kayıt olmak için mail adresinizi giriniz", keyboard);
    } catch (error) {
        console.log(error);
    }
};

module.exports = { SendCommandButtons, SendRegisterButtons };