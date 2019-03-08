const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

// Add Error Controller:
const errorController = require('./controllers/error');

// Add Model:
const User = require('./models/user');

const MONGODB_URI = 'mongodb+srv://phongp:Heroman1989@cluster0-k8zmj.mongodb.net/shop?retryWrites=true';

const app = express();

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
})


// Implement Ejs:
app.set('view engine', 'ejs');

app.set('views', 'views');


// Add Controller:
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
``
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


app.use((req, res, next) => {
  console.log('This always runs!');
  next(); // Allows the request to continue to the next middleware in line
});

// Add Middleware for Retrieving User:
app.use((req, res, next) => {
  User.findById('5c7ae7918ccd1c329cd986a2')
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose.connect(
  MONGODB_URI,
  { useNewUrlParser: true }
  )
  .then(result => {
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
    app.listen(3003);
  })
  .catch(err => {
    console.log(err);
  });