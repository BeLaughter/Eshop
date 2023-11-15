const express = require("express");
const Product = require("../model/Product");
const { categories } = require("../model/Categories");
const { default: mongoose } = require("mongoose");
const appErr = require("../helper/appErr");
const isAdmin = require("../middlewares/isAdmin");
const isLogin = require("../middlewares/isLogin");
const multer = require("multer")
const storageFile = require("../helper/cloudinary");
const router = express.Router();

//upload

const uploadFile = multer({storageFile});

//set image file type to the server
const FILE_TYPE_MAP = {
    "image/png":"png",
    "image/jpeg":"jpeg",
    "image/peg":"peg",
};
//store image
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error ("Invalid image type");
        if(isValid){
            uploadError=null;
        }
        cb(uploadError, "public/uploads");
    },
    filename: function (req, file, cb) {
      const fileName = file.originalname.replace(" ", " ");
     const extension = FILE_TYPE_MAP[file.mimetype];
     cb(null, `${fileName}-${Date.now()}.${extension}`);
    },
});
const upload = multer({ storage : storage});


// get all products
router.get(`/`, async (req, res) =>{
    let filter = {};
    if (req.query.categories){
        filter = { category: req.query.categories.split(",")};
    }

    const products = await Product.find(filter).populate("category");
    if  (!products) {
         res.status(404).send("No product data found")
    }
    res.send(products);
});

// CREATE product
router.post(`/`, upload.single("image"), isLogin, isAdmin, async(req, res, next) =>{
    const categoryFound = await categories.findById(req.body.category)
    if (!categoryFound){
        return next(appErr("Invalid category", 404));
    }

    const file = req.file;
    if(!file)return next(appErr("Provide the produt image ", 405));

    const {
        name,
        shortDescription,
        longDescription,
        image,
        brand,
        price,
        category,
        countInStock,
        rating,
       isFeatured,
       dateCreated,
    }= req.body;
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    const productFound = await Product.findOne({name});
    if(productFound){
        return next(appErr(`${name} already exists`, 404));
    }
    const product = new Product ({
        name,
        shortDescription,
        longDescription,
        image: `${basePath}${fileName}`,
        brand,
        price,
        category,
        countInStock,
        rating,
       isFeatured,
       dateCreated,
    })
   
     await product.save();
     if (!product) {
        return next(appErr("product not created", 404));
     }
     res.send(product);
    });


     //get single product
     router.get(`/:id`, async (req, res) =>{
       if (!mongoose.isValidObjectId(req.params.id)){
        return res.status(404).send("Invalid product ID")
       }

        const product = await Product.findById(req.params.id)
        .select("name image category -_id").populate("category");
        if  (!product) {
             res.status(404).json({message: "product not found"})
            }
        res.send(product);
    });   


    // delete product
    router.delete(`/:id`,  isLogin, isAdmin, (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)){
            return res.status(404).send("Invalid product ID")
           }
        Product.findByIdAndRemove(req.params.id)
      .then((product) => {
       if (product) {
           return res.status(200).json({
               success: true,
               message:"The Product was deleted successfully!",
           });}
            else {
           return res.status(500).json({
               success: false,
               message: "The product could not be found!",
           });}
           })
           .catch((err) => {
               return res.status(400).json({
                   success: false,
                   message: err
               });
           });
      });
    // update product
router.put(`/:id`, upload.single("image"),  isLogin, isAdmin, async (req, res) =>{
    
        const {
            name,
            shortDescription,
            longDescription,
            image,
            brand,
            price,
            category,
            countInStock,
            rating,
           isFeatured,
           dateCreated,
        }= req.body;

        if (!mongoose.isValidObjectId(req.params.id)){
            return res.status(404).send("Invalid product ID")
           }
        const productFound = await Product.findById(req.params.id);
        if  (!productFound) {
         return next(appErr("invalid product", 400));
        }

        const categoryFound = await categories.findById(req.params.id);
        if  (!categoryFound) {
         return next(appErr("invalid category", 400));
        }
        
        const file = req.file;
        let imagepath;

        if(file){
            const fileName = req.file.filename;
            const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
            imagepath = `${basePath}${fileName}`;
        } else{
            imagepath  = productFound.image;
        }
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name,
                shortDescription,
                longDescription,
                image: imagepath,
                brand,
                price,
                category,
                countInStock,
                rating,
               isFeatured,
               dateCreated,  
            },
            {
                new : true 
            })
            if(!product){
                return res.status(404).send("Product not updated");
            }
            res.send(product);
});   


// get count 

router.get(`/get/count`, isLogin, isAdmin, async(req,res) =>{
         const productCount = await Product.countDocuments();
         if(!productCount){
            res.status(404).json({sucess:false});
         }
         res.send({
            productCount: productCount,
         });
});

// get is featured
router.get(`/get/featured/:count`, async(req,res) =>{
    const count = req.params.count;
    const products = await Product.find({isFeatured:true}).limit(+count);
    if (!products){
        res.status(404).json({success : false});
    }
    res.send(products);
});

// upload multiple images
router.put(`/gallery-images/:id`, upload.array("images",10),  async (req, res, next) =>{
  if(!mongoose.isValidObjectId(req.params.id)){
    return next(appErr("Invalid Product Id", 400));
  }
  const files = req.files;
  let imagesPaths = [];
  const basePath  = `${req.protocol}://${req.get("host")}/public/uploads/`;
  if (files){
    files.map((file) =>{
        imagesPaths.push(`${basePath}${file.filename}`);
    });
  }
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
        images : imagesPaths,
    },
    {
        new : true,
    }
  );
  if(!product){
    return res.status(404).send("product not updated");
  }
  res.send(product);
});
    


module.exports = router;