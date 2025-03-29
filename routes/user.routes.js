const express = require("express");
const router = express.Router();
const { body, validationResult } = require('express-validator');    //for form validation here we use package express-validator
const userModel = require("../models/user.model.js")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.get("/register" , (req,res) =>{
    res.render("register.ejs");
});

router.post("/register" ,
    body('email').trim().isEmail().isLength({ min : 10}),       //middleware for validation
    body("password").trim().isLength({ min : 8}),
    body('username').trim().isLength({ min : 3})
    ,
     async (req,res) =>{
        try{

        

        const error = validationResult(req);
        if (!(error.isEmpty())) {  //if it is not empty means there is an error
            return res.status(400).json({
                error : error.array(),
                message : 'Invalid data'
            });
        }

        const {email , username , password} = req.body;
        const hashPassword = await bcrypt.hash(password , 10);     //hashing our password for 10 round. [generally 10 is enough].

        const newUser = await userModel.create({
            email,
            username,
            password : hashPassword,
        });

        res.redirect("/");
    }
    catch(err){
        res.send("error")
    }
    })

router.get("/login" , (req,res) =>{
    res.render("login.ejs");
})    

router.post("/login" , 
    body('email').trim().isEmail().isLength({ min : 10}),
    body("password").trim().isLength({ min : 8 })
    ,async (req,res) =>{
        const error = validationResult(req);
        if (!(error.isEmpty())) {  //if it is not empty means there is an error
            return res.status(400).json({
                error : error.array(),
                message : 'Invalid data'
            });
        }

        const {email , password} = req.body;

        const user = await userModel.findOne({
            email : email
        });

        if(!user){
            return res.status(400).json({
                message : "Either email or password is incorrect! "
            })
        }

        const isPassMatch = await bcrypt.compare(password , user.password);

        if(!isPassMatch){
            return res.status(400).json({
                message : "Either email or password is incorrect!"
            })
        }

        // if finally password matches then we generate a TOKEn through a package JSONWEBTOKEN.
        const token = jwt.sign(
            {
                userId: user._id,           //this will help us in authorization and finding post owner.
                username: user.username,
                email: user.email,
            },
            process.env.JWT_SECRETS,
            { expiresIn: "1h" } // Token expiry
        );

        // Set token in HTTP-only Cookie
        res.cookie("token", token, {
            httpOnly: true, // Prevent client-side access
            secure: process.env.NODE_ENV === "development", // HTTPS only in production
            sameSite: "strict", // Prevent CSRF attacks
            maxAge: 3600000, // 1 hour expiry
        });

        res.redirect("/home");

})



module.exports = router;