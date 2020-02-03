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

  function handleSaveToDB(agent){ //testing
    const text = agent.parameters.text;//parameters go here
    return admin.database().ref('data').set({
      first_name: 'Joe',
      last_name: 'Jones',
      text: text
    });
   
  }
  
  	function handleClearDonateDB(agent){
    	return admin.database().ref('fooddonate').set({
	  		fooditem: "default",
	  		foodlocation: "default",
	  		pickupcontact: "default",
	  		pickuptime: "default"
    });
    }       
	function handleClearRequestDB(agent){
    	return admin.database().ref('foodrequest').set({
	  		user_location: "default",
	  		user_zip: "default",
	  		user_name: "default",
	  		user_phone: "default"
    });
    }   
		
    function handlefoodrequest(agent){
        var text5 = agent.parameters.userlocation;
        var text6 = agent.parameters.userzipcode;
        var text7 = agent.parameters.username;
        var text8 = agent.parameters.userphone;
        return admin.database().ref('foodrequest').set({
            userlocation: text5,
            userzip: text6,
            username: text7,
            userphone: text8
    });
    }   

   function handlefooddonate(agent){
        var text1 = agent.parameters.fooditem;
        var text2 = agent.parameters.foodlocation;
        var text3 = agent.parameters.pickuptime;
        var text4 = agent.parameters.pickupcontact;
        return admin.database().ref('fooddonate').set({
	        fooditem: text1,
	        foodlocation: text2,
	        pickuptime: text3,
	        pickupcontact: text4
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
  intentMap.set('food.donate', handlefooddonate);  //works
  intentMap.set('food.request', handlefoodrequest); //firebase hates _
  intentMap.set('saveToDB', handleSaveToDB);  // testing
  intentMap.set('readFromDb', handleReadFromDB); //testing
  intentMap.set('clearRequestDBforDemo', handleClearRequestDB);  
  intentMap.set('clearDonateDBforDemo', handleClearDonateDB);  
  agent.handleRequest(intentMap);
});