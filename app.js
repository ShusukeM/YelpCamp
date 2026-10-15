const express = require("express");
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const Campground = require('./models/campground');
const Review = require("./models/review");
const { title } = require("process");
const { deserialize } = require("v8");
const ExpressError = require("./utils/ExpressError");
const catchAsync = require("./utils/catchAsync");
const {campgroundSchema, reviewSchema} = require("./schemas")
const { error } = require("console");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const session = require('express-session');
const flash = require('connect-flash');
const app = express();
mongoose.connect('mongodb://admin:password@mongodb:27017/yelp-camp?authSource=admin',
    { useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    }
).then( () => {
    console.log("connection OK");
})
.catch(err => {
    console.log("connection error");
    console.log(err);
});

app.engine("ejs", ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

const sessionConfig = {
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});
app.get("/", (req, res) => {
    // res.send("yelpcamp");
    res.render("home");
});
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.all("/{*path}", (req, res, next) => {
    next(new ExpressError("page not found", 404));
});
// 場所が大事
app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) {
        err.message = "error happend";
    }
    res.status(statusCode).render("error", { err });
});
app.listen(3000, () => {
    console.log("listening");
});
