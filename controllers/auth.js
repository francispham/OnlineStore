const bcrypt = require('bcryptjs');

const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    /* Before Session:
    // console.log(req.get('Cookie'));                       
    const isLoggedIn = req
        .get('Cookie')
        .trim()
        .split('=')[1] === 'true';
    // console.log(isLoggedIn);   
    */                    
    console.log(req.session.isLoggedIn)
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        // isAuthenticated: isLoggedIn // Before Session
        isAuthenticated: false
    });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isAuthenticated: false
    })
};

exports.postLogin = (req, res, next) => {
    User.findById('5c7ae7918ccd1c329cd986a2')
        .then(user => {
            req.session.isLoggedIn = true;
            req.session.user = user;
            // When you need the session surely save in the database
            req.session.save(err => {
                console.log(err);
                res.redirect('/');
            });
        })
        .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmpassword = req.body.confirmpassword;
    User.findOne({ email: email })
        .then(userDoc => {
            if (userDoc) {
                return res.redirect('/signup');
            }
            return bcrypt.hash(password, 12);
        })
        .then(hashedPassword => {
            const user = new User({
                email: email,
                password: hashedPassword,
                cart: { items: [] }
            });
            return user.save();    
        })
        .then(result => {
            console.log(result);
            res.redirect('/login');
        })
        .catch(err => {
            console.log(err);
        });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
};