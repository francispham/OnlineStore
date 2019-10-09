// ExpressJS Core Modules:
const path = require('path');
const fs = require('fs');
const https = require('https');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');


// Add Error & Shop Controllers:
const errorController = require('./controllers/error');
const shopController = require('./controllers/shop');
// Add Auth Middleware:
const isAuth = require('./middleware/is-auth');
// Add User Model:
const User = require('./models/user');

// console.log(process.env>NODE_ENV);

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-k8zmj.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true`;

const app = express();

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
})

const csrfProtection = csrf();

// const privateKey = fs.readFileSync('server.key');
// const certificate = fs.readFileSync('server.cert');

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb( null, true);
  } else {
    cb(null, false);
  }
}


// Implement Ejs:
app.set('view engine', 'ejs');
app.set('views', 'views');

// For Logging Data in Files instead of in Console when Deploying:
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

// Add Controller:
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

// For Production:
app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));

// For Serving Files & Images Statically (eg public folder): 
app.use(express.static('public'));
app.use('/images', express.static(path.join(__dirname, 'images')));

// For Parsing Incoming Request Bodies (under the req.body property):
app.use(bodyParser.urlencoded({
  extended: false
}));

// For Storing the Incoming Files:
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')) // 'image' because in ejs file: <input name="image">

app.use(
  session({ 
    secret: 'my supersecret', 
    resave: false, 
    saveUninitialized: false, 
    store: store 
  })
);

//app.use(csrfProtection); //Got move down after router.post()
app.use(flash());

// Add Authentication:
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
})


// Add Custom Made Middlewares:
app.use((req, res, next) => {
  console.log('This always runs!');
  next(); // Allows the request to continue to the next middleware in line
});

app.use((req, res, next) => {
  // throw new Error('Sync Dummy'); // This won't break the app with line 88
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      // throw new Error('Dummy'); // For Stimulate Error, will break the app with line 88
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      // throw new Error(err);
      next(new Error(err)); //ExpressJS's way of handling error! Or:
      // next();
    });
});


// Add Routes
app.post("/create-order", isAuth, shopController.postOrder);

// Add CSRFToken:
app.use(csrfProtection);
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// Error Handling:
app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  console.log(error);
  // res.status(error.httpStatusCode).render(...);
  // res.redirect('/500');
  res.status(500).render('500', {
    pageTitle: 'Error',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
});


mongoose.connect(
  MONGODB_URI,
  { useNewUrlParser: true }
  )
  .then(result => {
    // Before Implementing HTTPS:
    // app.listen(process.env.PORT || 3000);
    
    /* Before Using a Hosting Provider:
    https.createServer(
      {
        key: privateKey,
        cert: certificate
      },
      app
    ).listen(process.env.PORT || 3000);
    */

    app.listen(process.env.PORT || 3000);
    console.log("Listening Localhost: 3000 or NOT");
  })
  .catch(err => {
    console.log(err);
  });
