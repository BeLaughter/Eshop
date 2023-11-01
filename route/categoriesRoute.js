const express = require("express");
const { categories } = require("../model/Categories");
const isLogin = require("../middlewares/isLogin");
const isAdmin = require("../middlewares/isAdmin");
const router = express.Router();

//create categories
router.post(`/`, isLogin, isAdmin, async(req, res) =>{
    const Categories = new categories ({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
    });
     await Categories.save();
     if (!Categories) {
        res.status(500).send("category not created");
     }
     res.send(Categories);
    });

    // get all categories 
router.get(`/`, isLogin, async (req, res) =>{
    const Categories = await categories.find();
    if  (!Categories) { res.send("No category data found")}
    res.send(Categories);
});

    //get single category
router.get(`/:id`, async (req, res) =>{
        const Categories = await categories.findById(req.params.id);
        if  (!Categories) {
             res.status(404).json({message: "category with the id is not found"})
            }
        res.send(Categories);
    });   

//update category
router.put(`/:id`, isLogin, isAdmin, async (req, res) =>{
    const Categories = await categories.findByIdAndUpdate(
        req.params.id,
   {
    name : req.body.name,
    icon : req.body.icon,
    color : req.body.color,
   },
   {
    new:true,
   });

    if  (!Categories) {
         return res.status(404).send("The category with the id is not found")
        }
    res.send(Categories);
});   

// delete category
router.delete(`/:id`, isLogin, isAdmin, (req, res) => {
     categories.findByIdAndRemove(req.params.id)
   .then((Categories) => {
    if (Categories) {
        return res.status(200).json({
            success: true,
            message:"The category was deleted successfully!",
        });}
         else {
        return res.status(500).json({
            success: false,
            message: "The category could not be found!",
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