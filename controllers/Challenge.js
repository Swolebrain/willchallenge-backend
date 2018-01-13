module.exports = function(app, db, ChallengeEvidence, Challenge){
  
  app.get('/api/challenge', (req, res)=>{
    console.log('Received a request GET /challenge');
    
    Challenge.find()
      .then(dbRes=>{
        console.log('DB result: ',dbRes);
        res.json(dbRes);
      })
      .catch(err=>{
        console.log(err);
        res.json({err});
      });
  });

  app.post('/api/challengetest', (req, res)=>{
    res.send(req.user);
    //const newChallenge = new Challenge(req.body);
  });

  //add ChallengeEvidence to challenge
};