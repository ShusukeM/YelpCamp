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
const campgroundRoutes = require("./routes/campground");
const app = express();
mongoose.connect('mongodb://admin:password@mongodb:27017/yelp-camp?authSource=admin',
    { useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
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

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(detail => detail.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};
const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(detail => detail.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};
app.get("/", (req, res) => {
    // res.send("yelpcamp");
    res.render("home");
});
app.use("/campgrounds", campgroundRoutes);
app.post("/campgrounds/:id/reviews", validateReview, catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));
app.delete("/campgrounds/:id/reviews/:reviewId", catchAsync(async (req, res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {
        $pull: {
            reviews: reviewId
        }
    });
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/campgrounds/${id}`);
}));
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
