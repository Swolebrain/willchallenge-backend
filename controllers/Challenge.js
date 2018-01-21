const {
  Challenge,
  ChallengeEvidence,
  User
} = require('../models/connection.js');

module.exports = function(app){
  
  //get all challenges
  app.get('/api/challenge/all', (req, res)=>{
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
  app.get('/api/challenge', async (req, res)=>{
    let id = req.user.sub;
    console.log(`GET /api/challenge/${id}`);

    try {
      const ownedChallenges = await Challenge.find({owner: id})
      const currentUser = await User.findOne({_id: id});
      const {challengesSubscribed} = currentUser; //TODO: find challenges the user is subscribed to
      res.json([...ownedChallenges, ...challengesSubscribed]);
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

  //this one only accepts a properties description, newsubscriber, and unsubscribe in the request body
  app.patch('/api/challenge/:id', async (req, res) => {
    console.log(`PATCH /api/challenge/${req.params.id}`, req.body);
    const challengeToEdit = await Challenge.findOne({_id: req.params.id});
    if (!challengeToEdit) return res.setStatus(400).json({err: "Challenge not found"});

    const {newsubscriber, description, unsubscribe} = req.body;
    if (!newsubscriber && !description && !unsubscribe) 
      return  res.json({
        error: 'can only patch a challenge by adding/removing subscribers or changing the description'
      });
    let challengePatch = req.body;
    if (req.user.sub !== challengeToEdit.owner){ //if the requester is not the owner all he can do is toggle subscribe
      if (challengePatch.description) delete challengePatch.description;
      if (challengePatch.newsubscriber) challengePatch.newsubscriber = req.user.sub;
      if (challengePatch.unsubscribe) challengePatch.unsubscribe = req.user.sub;
    }
    
    if (challengePatch.newsubscriber){
      let indexInSubscribers = challengeToEdit.subscribers.indexOf(challengePatch.newsubscriber);
      if (indexInSubscribers === -1) challengeToEdit.subscribers.push(challengePatch.newsubscriber);
      console.log(`Subscribed ${challengePatch.newsubscriber} to ${challengeToEdit._id}`);
    }
    if (challengePatch.unsubscribe){
      let indexInSubscribers = challengeToEdit.subscribers.indexOf(challengePatch.unsubscribe);
      if (indexInSubscribers !== -1) {
        challengeToEdit.subscribers.splice(indexInSubscribers, 1);
        delete challengePatch.unsubscribe;
        console.log(`Subscribed ${challengePatch.newsubscriber} to ${challengeToEdit._id}`);
      }
    }
    Object.assign(challengeToEdit, challengePatch);

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