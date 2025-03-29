const mongoose = require("mongoose");
const dotenv = require('dotenv').config();

function connectToDB() {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log("Connected to DB"))
        .catch(err => console.error("Connection Failed", err));
}


module.exports = connectToDB;