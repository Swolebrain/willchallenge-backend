
module.exports = function(app, db, ChallengeEvidence, Challenge){
  
  //get all challenges
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

  //get all challenges a user owns and the ones he's subscribed to
  app.get('/api/challenge/:userid', async (req, res)=>{
    const {id} = req.params;
    console.log(`GET /challenge/${id}`);

    try {
      const ownedChallenges = await Challenge.find({owner: id})
      const subscribedChallenges = []; //TODO: find challenges the user is subscribed to
      res.json([...ownedChallenges, ...subscribedChallenges]);
    } catch(err) {
      console.log('Error while getting challenges for user '+ id, err);
      res.json({err});
    }
    
  });

  app.post('/api/challenge', (req, res)=>{
    console.log("POST /api/challenge");
    console.log(req.body);
    const newChallenge = new Challenge(Object.assign({subscribers: []}, req.body));
    newChallenge.save()
      .then(dbRes => {
        res.json(dbRes);
      })
      .catch(err => {
        res.setStatus(500).json({err});
      });
  });

  //this one only accepts a property newsubscriber in the request body
  app.patch('/api/challenge/:id', async (req, res) => {
    console.log(`PATCH /api/challenge/${req.params.id}`, req.body);
    const {newsubscriber, description} = req.body;
    if (!newsubscriber && !description) 
      return  res.json({
        error: 'can only patch a challenge by adding subscribers or changing the description'
      });
    
    const challengeToEdit = await Challenge.find({_id: req.params.id});
    console.log('Found challenge', challengeToEdit);
    //TODO: I gotta validate the subscriber exists
    if (newsubscriber) challengeToEdit.subscribers.push(newsubscriber);
    if (description) challengeToEdit.description = description;

    challengeToEdit.save()
      .then(dbRes => {
        console.log(`Saved challenge ${req.params.id}`, dbRes);
        res.json(dbRes);
      })
      .catch(err => {
        console.log(`Error Saving challenge ${req.params.id}`, err);
        res.json(err);
      })
    
  });

  //add ChallengeEvidence to challenge
};