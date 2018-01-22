const express = require('express');
const app = express();
app.set('port', 1337);
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const bp = require('body-parser');
const cp = require('cookie-parser');
const jwtDecode = require('jwt-decode');

// Authentication middleware. 
const checkJwt = jwt({
  // Dynamically provide a signing key
  // based on the kid in the header and 
  // the signing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://swolebrain.auth0.com/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: 'https://www.willchallenge-backend.com',
  issuer: `https://swolebrain.auth0.com/`,
  algorithms: ['RS256']
});

const allowedOrigins = [
  'localhost',
];

app.use((req,res,next) => {
  let i = allowedOrigins.indexOf(req.hostname);
  if (allowedOrigins[i] === -1) return next(); 
  let {origin} = req.headers;
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Headers', ['content-type', 'accept', 'authorization', 'x-id-token']);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  next();
});
//apparently this just checks the validity of the jwt
app.use(checkJwt);
app.use(bp.json());
app.use(cp());

//if i wanted to check a specific scope and add a middleware to that, i would do this:
//const checkScopes = jwtAuthz([ 'read:messages' ]);
//then use that variable checkScopes as a middleware


const {ChallengeEvidence, Challenge, User, connection} = require('./models/connection.js');

//DATABASE RELATED MIDDLEWARES

//function to detect first time login and add to users database
app.use(async function(req, res, next) {
  if (req.method.toLowerCase() === 'options') return next();
  console.log(req.method, 'REQUEST TO', req.url);
  
  let decodedToken;
  if (req.headers['x-id-token'])
    decodedToken = jwtDecode(req.headers['x-id-token']);

  //user is known and is on a known device that has the cookie
  if (req.cookies.knownuser) return next();

  //optimistically set this user to one we have seen
  res.cookie('knownuser', 'yes', {
    maxAge: 1000 * 60 * 60 * 24 * 365 * 25,
    httpOnly: true,
  });

  //looking up user to see if he's already in db
  //req.user.sub is the provider profile id, eg facebook|87236487236873246
  const user = await User.findOne({_id: req.user.sub});
  if (user){ 
    console.log('user already exists', user);
    if (
      user.firstName !== decodedToken.given_name ||
      user.lastName !== decodedToken.family_name ||
      user.pictureUrl !== decodedToken.picture
    ){
      user.firstName = decodedToken.given_name;
      user.lastName = decodedToken.family_name;
      user.pictureUrl = decodedToken.picture;
      user.save();
    }
    return next();
  }

  //user wasn't in db so let's add them
  let newUser = new User({
    _id: req.user.sub,
    challengesSubscribed: [],
    firstName: decodedToken.given_name,
    lastName: decodedToken.family_name,
    pictureUrl: decodedToken.picture
  });
  newUser.save();
  
  next();
});



app.get('/', (req, res)=> res.end('hello world'));

//challenge controllers:
require('./controllers/Challenge.js')(app);



app.listen(app.get('port'), ()=>console.log('Server listening on port '+ app.get('port')));