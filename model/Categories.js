const mongoose = require("mongoose");
const categoriesSachema= mongoose.Schema({
    name : { 
        type: String,
        required: true,
    },
    icon : {
        type: String,
    },
    color : {
        type: String,
    }
});

categoriesSachema.virtual("id").get(function(){
    return this._id.toHexString();
});

categoriesSachema.set("toJSON",{
    virtuals:true,
});

exports.categories = mongoose.model('Categories', categoriesSachema); 

