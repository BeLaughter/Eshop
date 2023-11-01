const express = require("express");
const {  User } = require("../model/User");
const { default: mongoose } = require("mongoose");
const bcrypt = require("bcryptjs");
const isLogin = require("../middlewares/isLogin");
const generateToken =  require("../helper/generateToken");
const isAdmin = require("../middlewares/isAdmin");
const router = express.Router();


//create user
router.post(`/register`, isLogin, isAdmin, async(req, res) =>{
    const{
            name,
            email,
            passwordHash,
            phone,
            isAdmin,
            street,
            apartment,
            zip,
            city,
            country,
    }=req.body
   
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordHash, salt);
    let User = new user ({
        name,
        email,
        passwordHash:hashedPassword,
        phone,
        isAdmin,
        street,
        apartment,
        zip,
        city,
        country,
    });
     User = await User.save();
     if (!User) {
        res.status(500).send("User not created");
     }
     res.send(User);
    });

// login user
router.post(`/login`, async(req, res) =>{
const {email, passwordHash} = req.body;
//check if email exists
    const userEmailFound = await User.findOne({email});
    if(!userEmailFound){
     return res.json({
        message:"invalid login credentials",
     });
    }
//verify password
const isPasswordMatched = await bcrypt.compare(
    passwordHash,
    userEmailFound.passwordHash
);
if(!isPasswordMatched){
    return res.json({message:"invalid login credentials"});
};

res.json({
    status:"success",
    data:{
        email:userEmailFound.email,
        name:userEmailFound.name,
        isAdmin: userEmailFound.isAdmin,
        token: generateToken(userEmailFound._id),
    },
});

})

 // get all users 
 router.get(`/`, isAdmin, isLogin, async (req, res) =>{
    const User = await user.find();
    if  (!User) { res.send("No user data found")}
    res.send(User);
});
  
//get single user
router.get(`/profile`, isLogin, async (req, res) =>{
     const User = await user.findById(req.userAuth);
     if  (!User) {
         return res.status(404).json({message: "user not found"})
         }
     res.status(200).send(User);
 });   

// delete user
router.delete(`/:id`, isAdmin, isLogin, (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)){
        return res.status(404).send("Invalid user ID")
       }
    user.findByIdAndRemove(req.params.id)
  .then((user) => {
   if (user) {
       return res.status(200).json({
           success: true,
           message:"The user was deleted successfully!",
       });}
        else {
       return res.status(500).json({
           success: false,
           message: "The user could not be found!",
       });}
       })
       .catch((err) => {
           return res.status(400).json({
               success: false,
               message: err
           });
       });
  });


    module.exports = router;