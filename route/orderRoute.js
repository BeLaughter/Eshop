const express = require("express");
const router = express.Router();
const isLogin = require("../middlewares/isLogin");
const { Order} = require("../model/Order");
const appErr = require("../helper/appErr");
const { OrderItem } = require("../model/Order-Item");
const isAdmin =  require("../middlewares/isAdmin");
const Product = require("../model/Product");

// CREATE ORDER 
router.post("/", isLogin, async (req,res, next) =>{
    const {orderItems, shippingAddress1, shippingAddress2, city, zip, country, phone, status, totalPrice,
         user} = req.body;
         const orderItemsIds = Promise.all(orderItems.map(async(orderItem)=>{
          let newOrderItem = new OrderItem({
            quantity : orderItem.quantity,
            product: orderItem.product
          });
          newOrderItem = await newOrderItem.save();
          return newOrderItem._id
         })
         );

         //
         const orderItemsIdsResolved = await orderItemsIds;
         const totalPrices = await Promise.all( orderItemsIdsResolved.map(async(orderItemsId) => {
            const orderItem = await OrderItem.findById(orderItemsId).populate("product", "price");
            const totalSum = orderItem.product.price * orderItem.quantity;
            return totalSum;
         })
         );
         const totalSum = totalPrices.reduce((a, b) => a + b, 0)

         let order = new Order({orderItems: orderItemsIdsResolved, shippingAddress1, shippingAddress2, city, zip,
        country, phone, status, totalPrice: totalSum, user: req.userAuth});
        order = await order.save();
        if(!order){
            return next (appErr("Order Not Created"));
        }
        res.send(order)
});

// get all orders
router.get("/", isLogin, isAdmin, async (req, res, next) =>{
    const orderList = await Order.find().populate("user","name").populate({path:"orderItems", populate:{
        path: "product", populate:"category"}}).sort({dateOrdered: -1});
        if(!orderList){
            return next (appErr("order cannot be found", 404))
        }
        res.send(orderList)
});

//get single order 
router.get("/single-order", isLogin, async (req, res, next) =>{
    const orderList = await Order.find({user:req.userAuth})
       
        if(!orderList){
            return next (appErr("order with the id not found"))
        }
        res.send(orderList)
});

//to update a order
router.put("/:id", isLogin, isAdmin, async (req, res, next) =>{
    const {orderItems, shippingAddress1, shippingAddress2, city, zip, country, phone, status, totalPrice,
        user} = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {orderItems, shippingAddress1, shippingAddress2, city, zip, country, phone, status, totalPrice,
                user},
                {
                    new: true,
                }
        );
        if(!order){
            res.status(404).send("order with id not found")
        }
        res.send(order);
});

// to delete
router.delete("/:id", isLogin, isAdmin, async (req, res, next) =>{
     Order.findByIdAndRemove(req.params.id).then((order) => {
    if (order){
        return res.status(200).json({
            success: true,
            message: "order deleted successfully"
        });
    } else {
        return res.status(500).json({
            success: false,
            message: "order could not be found"
        });
    }
     }).catch((err) => {
           return res.status(400).json({ success: false, message:err})
     });
    });

    // count total number of orders
    router.get("/get/count", isLogin, isAdmin, async (req, res) =>{
        const orderCount = await Order.countDocuments();
            if(!orderCount){
                res.status(404).json({success: false});
            }
            res.send({
                orderCount: orderCount
            });
        });

        //ttottal sales
        router.get("/get/totalsales", isLogin, isAdmin, async (req, res, next) =>{
            const totalSales = await Order.aggregate([
                {$group: {_id: null, totalSales: {$sum: "$totalPrice"}}}
            ]);
                if(!totalSales){
                    return next (appErr("totalsales cannot be generated", 403))
                }
                res.send({totalSales: totalSales.pop().totalSales});
            });


            module.exports = router;