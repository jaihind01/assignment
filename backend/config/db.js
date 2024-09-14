const mongoose=require('mongoose');
const connectDB=async()=>{
    try{
    await mongoose.connect('mongodb://127.0.0.1:27017/assign');
    console.log("connect to db");
    }
    catch(err){
        console.log(err);
    }
}

module.exports=connectDB;