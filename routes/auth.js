const router = require('express').Router();
const authController = require('../controllers/authController');
const util = require('../utilities/index');
const passport = require('passport');

router.get('/google', passport.authenticate('google', { scope: ['profile'] }));
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/exercise' }),
    (req, res) => {
        // Successful authentication, redirect home.
        console.log('Authenticated User:', req.user);
        res.redirect('/user/google/' + req.user.googleId); // Redirect to user profile or desired page
    }
);
router.get('/logout', util.handleErrors(authController.logout));

//router.get('/login', util.handleErrors(authController.isloggedIn));

//router.post('/login', passport.authenticate('local'), util.handleErrors(authController.login));

module.exports = router;