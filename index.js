const express = require('express');
const app = express();
app.set('port', 1337);
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

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

const db = require('./models/connection');
const {ChallengeEvidence, Challenge} = require('./models/Challenge.js')(db);

const allowedOrigins = [
  'localhost',
];
app.use((req,res,next) => {
  let i = allowedOrigins.indexOf(req.hostname);
  if (allowedOrigins[i] === -1) return next(); 
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Method', 'GET, POST, PUT, DELETE');
  next();
});
//apparently this just checks the validity of the jwt
app.use(checkJwt);

//if i wanted to check a specific scope and add a middleware to that, i would do this:
//const checkScopes = jwtAuthz([ 'read:messages' ]);
//then use that variable checkScopes as a middleware

app.get('/', (req, res)=> res.end('hello world'));

//challenge controllers:
require('./controllers/Challenge.js')(app, db, ChallengeEvidence, Challenge);



app.listen(app.get('port'), ()=>console.log('Server listening on port '+ app.get('port')));