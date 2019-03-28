const express = require('express');
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', authController.postLogin);

router.post(
    '/signup', 
    [
        check('email')
            .isEmail()
            .withMessage('Please Enter a Valid Email!')
            .custom((value, { req }) => {
                if (value === 'aidsphong@yahoo.com') {
                    throw new Error('This email address is forbidden.')
                }
                return true;
            }),
        body(
            'password',
            'Please enter a password with only number & text & at least 5 characters.'
            )
            .isLength({ min:5 })
            .isAlphanumeric()
    ],
    authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;