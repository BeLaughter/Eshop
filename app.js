require("dotenv").config();
const express = require("express");
const app = express()
const morgan = require("morgan");
const mongoose = require("mongoose");
const api = process.env.API_URL;
const productRouter = require('./route/productRoute')
const categoriesRouter = require('./route/categoriesRoute')
const cors = require("cors");
const orderRouter = require('./route/orderRoute')
const userRouter = require('./route/userRoute');
const globalErrHandler = require("./middlewares/globalErrHandler");

app.use(cors());
app.options("*", cors());

// middleware
app.use(express.json(),);
app.use(morgan("tiny"));
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));

//routes
app.use(`${api}/products`,productRouter);
app.use(`${api}/categories`,categoriesRouter);
app.use(`${api}/user`,userRouter);
app.use(`${api}/orders`, orderRouter);

// error handler middlewears
app.use(globalErrHandler);

//404 error
app.use("*", (req, res) => {
    res.status(404).json({
        message:`${req.originalUrl} - route not found`,
    });
});

mongoose.connect(process.env.CONNECTION_STRING, {
 useNewUrlParser:true,
 useUnifiedTopology:true,
})
.then(() => {
   console.log("database connection is ready....")
})
.catch((err) => {
    console.log(err)
});


app.listen(3000, () => {
    console.log("server is running on http://localhost:3000");
});