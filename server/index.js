//requirements
require('dotenv').config();
const express = require('express');
const bodyparser = require('body-parser');
const massive = require('massive');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const cors = require('cors');
const controller = require('./controller/twitter_controller');
const axios = require('axios');
const paymentController = require('./controller/payment_controller');

//app set up

const checkforSession = require('./middleware/checkForSession');
const app = express();

app.use(bodyparser.json());
app.use(cors());
massive(process.env.CONNECTION_STRING).then(db => {
    app.set('db', db);
})

// sessions

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}))

//authentication
app.use(passport.initialize());
app.use(passport.session());

passport.use(new Auth0Strategy({
    domain: process.env.AUTH_DOMAIN,
    clientID: process.env.AUTH_CLIENT_ID,
    clientSecret: process.env.AUTH_CLIENT_SECRET,
    callbackURL: process.env.AUTH_CALLBACK_URL,
    scope: 'openid profile'
}, function (accessToken, refreshToken, extraParams, profile, done) {
    let { displayName, user_id, picture } = profile
    let image = picture.replace('normal', '400x400')
    const db = app.get('db')

    db.find_user([user_id]).then(function (users) {
        if (!users[0]) {
            db.create_user(
                [user_id, displayName, image]
            ).then(user => {
                return done(null, { token: accessToken, id: user[0].auth_id })
            })
        } else if (users[0]) {
            db.update_user([user_id, displayName, image])
                .then(user => {
                    return done(null, { token: accessToken, id: user[0].auth_id })
                })
        } else {
            return done(null, users[0].auth_id)
        }
    })
}))

passport.serializeUser((user, done) => {
    return done(null, user);
})

passport.deserializeUser((user, done) => {
    app.get('db').find_user([user.id])
        .then(function (foundUser) {
            return done(null, Object.assign(foundUser[0], { token: user.token }))
        })
})


app.get('/auth', passport.authenticate('auth0'));
app.get('/auth/callback', passport.authenticate('auth0', {
    successRedirect: 'http://localhost:3000/#/home',
    failureRedirect: '/'
}));

//Auth0 Endpoints
app.get('/auth/me', (req, res) => {
    if (!req.user) {
        res.status(404).send('User not found');
    } else {
        res.status(200).send(req.user)
    }
})
app.get('/auth/logout', (req, res) => {
    req.logOut();
    res.redirect(process.env.LOGOUT_REDIRECT)
})


//TwitterBook Endpoints
app.get('/api/twitter', controller.getTweets) //get tweets
app.post('/api/searchedUser', controller.searchTweets) //search for tweets from other people
app.get('/api/get-featured-books', controller.getBooks) //get books
app.post('/api/create-book', controller.updateBooks) //update books
app.post('/api/addtocart', controller.addToCart) //add to cart
app.get('/api/getcart', controller.getCart) //get cart for specified user
app.post('/api/updatetweets', controller.updateTweets) //adds tweets to booktweets table prior to customizing the book
app.get('/api/selectedtweets', controller.selectedTweets) //gets selected tweets for book creation step 4
app.delete('/api/removefromcart/:bookId', controller.removeFromCart) //remove book from cart
app.put('/api/changequantity/:bookId/:diff', controller.changeQuantity) //change quantity in cart for specific book in cart
app.get('/api/getdrafts/', controller.getDrafts) //get drafts of books for a particular customer

//Stripe Endpoint
app.post('/api/payment', paymentController.payment); //payment

//port
const port = process.env.SERVER_PORT || 4321
app.listen(port, () => console.log(`Lots of heavy petting on port ${port}`))