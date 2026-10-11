const express = require("express");
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const Campground = require('./models/campground');
const { title } = require("process");
const { deserialize } = require("v8");
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

app.listen(3000, () => {
    console.log("listening");
});
app.get("/", (req, res) => {
    // res.send("yelpcamp");
    res.render("home");
})
app.get("/campgrounds", async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
})
app.get("/campgrounds/new", async (req, res) => {
    res.render('campgrounds/new');
})
app.get("/campgrounds/:id", async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/show", { campground });
})
app.post("/campgrounds", async (req, res) => {
    const campground = new Campground(
        req.body.campground
    );
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
})
app.get("/campgrounds/:id/edit", async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground });
})
app.put("/campgrounds/:id", async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,
        {
            // title: req.body.campground.title,
            // location: req.body.campground.location
            ...req.body.campground
        }
    );
    res.redirect(`/campgrounds/${campground._id}`);
})
app.delete("/campgrounds/:id", async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
})
