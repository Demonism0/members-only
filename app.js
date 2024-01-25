const express = require('express');

const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// Set up mongoose connection
mongoose.set('strictQuery', false);

const mongoDB = process.env.MONGODB_URI || process.env.MONGODB_KEY;

async function main() {
  await mongoose.connect(mongoDB);
}
main().catch((err) => console.log(err));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'mickeymouse clubhouse',
  resave: false,
  saveUninitialized: true,
}));

const User = require('./models/user');

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return done(null, false, { message: 'Incorrect username' });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: 'Incorrect password' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

const indexRouter = require('./routes/index');
const profileRouter = require('./routes/profileRouter');
const messageRouter = require('./routes/messageRouter');

app.use('/', indexRouter);
app.use('/profile', profileRouter);
app.use('/message', messageRouter);

module.exports = app;
