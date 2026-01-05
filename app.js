//If env value is not production then we can use .env file 
//When we deploy it then it is in production level soo we dont use .env files coz we store credentials there.
if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const port = 8080;
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const { execPath } = require("process");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

//Importing Routes
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// connecting to DB

const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connected to DB");
    app.listen(port, () => {
      console.log("server is listening to 8080 port");
    });
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

//Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  secret: process.env.SECRET,
  touchAfter: 24*3600,  
});

store.on("error", (err) => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie : {
    expires: Date.now() + 7*24*60*60*1000,
    maxAge: 7*24*60*60*1000,
    httpOnly: true,
  },
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); //To store user info in session
passport.deserializeUser(User.deserializeUser()); //To remove user info from session

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  //console.log(res.locals.success);
  next();
});

// app.get("/demouser", async (req,res) => {
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "delta-student",
//   });

//   let registeredUser = await User.register(fakeUser, "helloworld");//To register a new user with a given password. Checks if username is unique
//   res.send(registeredUser);
// })

//Using Routes
app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

//Handle all 404 Errors
app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});


//Error Handler Middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message } = err;
  console.log("Error occurred:", err);
  res.status(statusCode).render("error.ejs", { message });
  //res.status(statusCode).send(message);
});
