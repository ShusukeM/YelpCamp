const express = require("express");
const router = express.Router();
const { storeReturnTo } = require('../middleware');
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const User = require('../models/user');
const passport = require('passport');

router.get('/register', (req, res) => {
    res.render('users/register');
});
router.post('/register', async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash('success', 'welcome to YelpCamp!');
            res.redirect('/campgrounds');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
});

router.get('/login', (req, res) => {
    res.render('users/login');
});
router.post('/login', storeReturnTo, passport.authenticate('local',
    {
        failureFlash: true, failureRedirect: '/login'
    }),
    async (req, res) => {
        req.flash('success', 'welcome back!');
        const redirectUrl = res.locals.returnTo || '/campgrounds';
        delete req.session.returnTo;
        res.redirect(redirectUrl);
    });

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
});
module.exports = router;
