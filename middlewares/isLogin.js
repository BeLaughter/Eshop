const getTokenFromHeader = require("../helper/getTokenFromHeader");
const verifyToken = require("../helper/verifyToken");


const isLogin = (req, res, next) =>{
// get token from header
const token = getTokenFromHeader(req);
//verify the token
const decodedUser = verifyToken(token);
//save user into req obj

req.userAuth = decodedUser.id;
if(!decodedUser){
    return res.json({
        message:"Invalid/Expired token, please login again"
    });
} else{
    next();
}
};
module.exports = isLogin;