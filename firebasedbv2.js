'use strict';
 
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
 
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'ws://foodbot-igoodm.firebaseio.com/'
  });

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  function handleSaveToDB(agent){
    const text = agent.parameters.text;//parameters go here
    return admin.database().ref('data').set({
      first_name: 'Joe',
      last_name: 'Jones',
      text: text
    });
   
  }

    function handlefoodrequest(agent){
    const text0 = agent.parameters.user_datetime;//parameters go here
    const text1 = agent.parameters.user_location;//parameters go here
    const text2 = agent.parameters.user_zip;//parameters go here
    const text3 = agent.parameters.user_name;//parameters go here
    const text4 = agent.parameters.user_phone;//parameters go here  
    return admin.database().ref('foodrequest').set({
      user_datetime: text0,
	  user_location: text1,
	  user_zip: text2,
	  user_name: text3,
	  user_phone: text4
    });
   
      
  }
  
  
  function handleReadFromDB(agent){
    return admin.database().ref('data').once('value').then((snapshot) => {
    	const value = snapshot.child('text').val();
      	if(value !== null){
         	agent.add(`the value is ${value}`);
        }
    });  
  }  
  
 	 let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  //intentMap.set('food.donate', handlefooddonate);  
  intentMap.set('food.request', handlefoodrequest); 
  intentMap.set('saveToDB', handleSaveToDB);  
  intentMap.set('readFromDb', handleReadFromDB); 
  agent.handleRequest(intentMap);
});