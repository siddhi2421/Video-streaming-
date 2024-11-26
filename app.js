const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const ejsMate = require('ejs-mate');
require('express-async-errors');
// Load environment variables
dotenv.config();

const app = express();

const dbUrl = process.env.ATLASDB_URL;

// Connect to MongoDB
main()
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

  async function main(){
    await mongoose.connect(dbUrl);
  }
// EJS setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// Use express-ejs-layouts middleware

app.engine("ejs", ejsMate);
// Set the default layout to `layout.ejs`

app.use(express.static('public'));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));


const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
      secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("ERROR IN MONGO SESSION STORE", err);
});
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie:{
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000 ,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true
  },
};

app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

app.use((err, req, res, next) => {
  console.error(err); // Log the error
  res.status(err.status || 500).render('error', { message: err.message });
});

app.use((req, res, next) => {
  res.locals.user = req.user || null; // Set `user` to null if not logged in
  next();
});

// Passport Config
const { configurePassport } = require('./config/config');
configurePassport(passport); // Correctly initialize Passport

// Global Variables Middleware for Flash Messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error'); // For Passport error messages
  next();
});

// Import Routes
const Routes = require('./routes/routes');

// Use Routes
app.use('/', Routes);
// Route to display user's watch history


const PORT = process.env.PORT || 8089;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
