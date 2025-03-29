const express = require("express");
const fs = require("fs");
const dotenv = require('dotenv').config();
const loadSupabase = require("../config/supabase"); // ✅ Correct

const upload = require("../config/multer");
const router = express.Router();
const userModel = require("../models/user.model.js")
const fileModel = require("../models/file.model.js")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {verifyJWT} =  require('../middlewares.js');
const { default: mongoose } = require("mongoose");


router.get('/home' ,verifyJWT, async (req,res)=>{
    const userFiles = await fileModel.find({
        user : req.user.userId
    }).sort({ _id: -1 });

    const user = await userModel.findById(req.user.userId);

    // console.log(userFiles);

     res.render('home.ejs' , {files : userFiles , user });
}) 


router.post(
    "/upload",
     verifyJWT,
     upload.single("file"),
     async (req, res) => {
     try {
         const supabase = await loadSupabase();
         const file = req.file;
 
         if (!file) return res.status(400).json({ error: "No file provided" });
 
         // Define a proper file path for Supabase
         const filePath = `uploads/${file.filename}`;
 
         // Read the local file before uploading
         const fileBuffer = fs.readFileSync(file.path);
 
         // Upload the file to Supabase Storage
         const { data, error } = await supabase.storage
             .from(process.env.SUPABASE_BUCKET_NAME)
             .upload(filePath, fileBuffer, {
                 contentType: file.mimetype,
             });
 
         if (error) throw error;
 
         // ✅ Delete the file from the local /uploads folder after successful upload
         fs.unlink(file.path, (err) => {
             if (err) console.error("Failed to delete local file:", err);
         });
 
         const newFile = await fileModel.create({
            path : data.path,
            fullPath : data.fullPath,
            fileName : file.filename,
            user : req.user.userId
         })

         res.redirect("/home");
     } catch (err) {
         console.error("Supabase Upload Error:", err);
         res.status(500).json({ error: "File upload failed", details: err.message });
     }
 });





router.get('/download/uploads/:path', verifyJWT, async (req, res) => {
    try {
        // console.log("Download request received!");

        const loggedInUserId = req.user.userId;
        const requestedPath = req.params.path;

        // console.log("Requested Path from URL:", requestedPath);
        // console.log("User ID:", loggedInUserId);

        // Check if requestedPath is correct
        const file = await fileModel.findOne({ user: loggedInUserId, path: "uploads/" + requestedPath });

        if (!file) {
            // console.log("❌ File not found in DB. Double-check path format.");
            return res.status(404).json({ message: "File not found or unauthorized access" });
        }

        // console.log("✅ File Found in DB:", file);

        // Load Supabase
        const supabase = await loadSupabase();

        // Ensure correct file path for Supabase
        const supabaseFilePath = file.path;
        // console.log("Supabase File Path:", supabaseFilePath);

        // Generate signed URL
        const { data, error } = await supabase.storage
            .from(process.env.SUPABASE_BUCKET_NAME)  
            .createSignedUrl(supabaseFilePath, 60); 

        if (error || !data) {
            // console.error("❌ Error generating signed URL:", error);
            return res.status(500).json({ message: "Error generating download link" });
        }

        // console.log("✅ Signed URL Generated:", data.signedUrl);

        // Force download
        res.setHeader("Content-Disposition", `attachment; filename="${file.fileName}"`);
        res.redirect(data.signedUrl);

    } catch (err) {
        // console.error("❌ Internal server error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});




  


  




 







module.exports = router;