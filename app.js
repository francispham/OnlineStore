const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const keys = require('./config/keys');


// Add Error Controller:
const errorController = require('./controllers/error');


// Add User Model:
const User = require('./models/user');

const MONGODB_URI = keys.MONGODB_URI;

const app = express();

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
})

const csrfProtection = csrf();


// Implement Ejs:
app.set('view engine', 'ejs');
app.set('views', 'views');


// Add Controller:
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');


// For Serving Files Statically (eg public folder): 
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(
  session({ 
    secret: 'my supersecret', 
    resave: false, 
    saveUninitialized: false, 
    store: store 
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  console.log('This always runs!');
  next(); // Allows the request to continue to the next middleware in line
});


// Add Custom Made Middlewares:
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      throw new Error(err); //ExpressJS's way of handling error! Or:
      // next();
    });
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
})


// Add Routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// Error Handling:
app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(...);
  res.redirect('/500');
});


mongoose.connect(
  MONGODB_URI,
  { useNewUrlParser: true }
  )
  .then(result => {
    /* Do Not Need this anymore:
    // Hard coded user:
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: 'Francis',
          email: 'test@test.com',
          cart: {
            items: []
          }
        });
        user.save();
      }
    });
    */
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });