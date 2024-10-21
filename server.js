const express = require("express");
const cors = require("cors");

const app = express();
app.user(cors());

require("dotenv").config()
const connectDB = require("./config/mongodb")
const indexRoutes = require("./routes/index.routes")
const userRoutes = require("./routes/user.routes")
const productRoutes = require("./routes/products.routes")
connectDB();


app.use(express.json());
app.use(express.urlencoded({extended: true}))

app.use("/", indexRoutes)
app.use("/user", userRoutes)
app.use("/product", productRoutes)

app.listen(3000, ()=>{
    console.log("server is running on port 3000")
})