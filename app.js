const express = require("express");
const app = express();
const port = 3000;
const { databaseConnect } = require("./services/DBconnect");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/userRouter");
const {
  checkForAuthenticationCookie,
} = require("./middlewares/authentication");

databaseConnect("mongodb://127.0.0.1:27017/productSite");



app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("cookie"));
app.use("/user", userRouter);


app.get("/", async (req, res) => {
  res.send("Welcome to product site backend");
});

app.listen(port);
