const mongoose = require("mongoose");
const { create } = require("./user.model");



const fileSchema = new mongoose.Schema({
    path : {
        type : String,
        required : [true , "Path is required"]
    },
    fullPath : {
        type : String,
        required : [true , "Full Path is required"],
    },
    fileName : {
        type : String,
        required : [true , "FullName is required"],
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'users',
        required : [true , 'User is Required'],
    }

})


const file = mongoose.model('file' , fileSchema);

module.exports = file;