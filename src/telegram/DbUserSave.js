const database = require("../utils/database");

const DbUserSave=async(msg)=>{
  try {
    //console.log(msg)
    await database.user.create({
        data:{
            username:msg.from.first_name,
            chatid:Number(msg.from.id),
            email:msg.text
        }
    })
  } catch (error) {
    console.log(error)
  }

}
module.exports=DbUserSave