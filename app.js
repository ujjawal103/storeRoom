const exp = require("constants");
const express = require("express");
const userRouter = require("./routes/user.routes");
const indexRouter = require("./routes/index.routes");
const dotenv = require('dotenv');
const connectToDB = require("./config/db");
const cookieParser = require("cookie-parser");


const path = require("path");

connectToDB();     //calling function for db connection.
dotenv.config();
const app = express();

PORT = 8080;

app.set("view engine","ejs");
app.set("views" , path.join(__dirname , "views") );
app.use(express.static(path.join(__dirname , "public")));
app.use(express.urlencoded({extended : true}));
app.use(cookieParser());
app.use(express.json());       //--------????? why

//routes
app.use("/" , indexRouter);
app.use("/user" , userRouter);  //starting with /user

app.get("/",(req,res)=>{
    res.render("main.ejs");
});



//last way to find error.
process.on("uncaughtException",(err) =>{
    console.log("Uncaught Exceptrion");
    console.log(err);
})




app.listen(PORT,()=>{
    console.log("server listen to 8080 ."); 
})