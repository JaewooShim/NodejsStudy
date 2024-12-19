
const express = require("express"),
  layouts = require("express-ejs-layouts"),
  app = express(),
  router = require("./routes/index"),
  mongoose = require("mongoose"),
  methodOverride = require("method-override");

const passport = require("passport"),
  cookieParser = require("cookie-parser"),
  expressSession = require("express-session"),
  User = require("./models/user");
const connectFlash = require("connect-flash");
require("dotenv").config();


mongoose.connect(process.env.MONGODB_URI).then(() => console.log("connected"));

app.set("port", process.env.PORT || 3000);
app.set("view engine", "ejs");
app.set("token", process.env.TOKEN || "recipeT0k3n");

app.use(
methodOverride("_method", {
    methods: ["POST", "GET"]
})
);

app.use(layouts);
app.use(express.static("public"));
app.use(connectFlash());

app.use(
express.urlencoded({
    extended: false
})
);
app.use(express.json());

app.use(cookieParser("secretCuisine123"));
app.use(expressSession({
  secret: "secretCuisine123",
  cookie: {
    maxAge: 4000000
  },
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session()); 

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.flashMessages = req.flash();
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.currentUser = req.user;
  res.locals.token = "";
  next();
});

app.use("/", router);

const server = app.listen(app.get("port"), () => {
  console.log(`Server running at http://localhost:${app.get("port")}`);
});
const io = require("socket.io")(server);
require("./controllers/chatController")(io);