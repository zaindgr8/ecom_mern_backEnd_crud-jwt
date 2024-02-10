const mongoose= require("mongoose")
const userSchema= new mongoose.Schema({
    name:String,
    price:String,
    category:String,
    userId:String,
    company:String
})

module.exports=mongoose.model("users", userSchema)