const mongoose = require("mongoose");
const productSachema= mongoose.Schema({
    name : {
        type: String,
        required: true,
    },
    shortDescription : {
        type: String,
        required: true,
    },
    longDescription : {
        type: String,
    },
    image : {
        type: String,
        default:"",
    },
    images : [{
        type: String,
    }],
    brand : {
        type: String,
        default:"",
    },
    price : {
        type: Number,
        default: 0,
    },
    category : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Categories",
        required: true,
    },
    countInStock : {
        type: Number,
        required: true,
        min:0,
        max:255,
    },
    rating : {
        type: Number,
        default: 0,
    },
    isFeatured : {
        type: Boolean,
        default: false,
    },
    dateCreated : {
        type: Date,
        default: Date.now,
    },
    
});

productSachema.virtual("id").get(function(){
    return this._id.toHexString();
});

productSachema.set("toJSON",{
    virtuals:true,
});

const Product = mongoose.model('Product', productSachema); 

module.exports = Product;