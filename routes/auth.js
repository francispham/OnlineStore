const express = require('express');

// Add Validation:
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post(
    '/login',
    [
        body('email')
            .isEmail()
            .withMessage('Not A Valid Email!')
            .normalizeEmail({ gmail_remove_dots:false }),
        body(
            'password',
            'Please enter a password with only number & text & at least 5 characters.'
            )
            .isLength({ min:5 })
            .isAlphanumeric()
            .trim()
    ],
    authController.postLogin
);

router.post(
    '/signup', 
    [
        check('email')
            .isEmail()
            .withMessage('Please Enter a Valid Email!')
            .custom((value, { req }) => {
                /*
                if (value === 'aidsphong@yahoo.com') {
                    throw new Error('This email address is forbidden.')
                }
                return true;
                */
                return User.findOne({ email: value }).then(userDoc =>{
                    if (userDoc) {
                        return Promise.reject(
                            'E-Mail exists already, please pick a different one.'
                        );
                    }
                });
            })
            .normalizeEmail({ gmail_remove_dots:false }),
        body(
            'password',
            'Please enter a password with only number & text & at least 5 characters.'
            )
            .isLength({ min:5 })
            .isAlphanumeric()
            .trim(),
        body('confirmPassword')
            .trim()
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords have to match');
                }
                return true;
            })
    ],
    authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;