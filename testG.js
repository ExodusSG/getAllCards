var async = require("async"); 
var Trello = require("node-trello");
var getRequests = require("./getRequests");

var appkey = 'yourappkey';
var token = 'yourtoken';

var g = new getRequests(appkey,token);


g.getBoardId(function(data){
	//console.log(data);
});

g.getListByBoardId("zUkUyFOS",function(data){
	//console.log(data);
	   	/*console.log(data);
*/
});

g.getCardByListId("556dbc25ea7a473e974742fe",function(data){
	//console.log(data);
});

g.getActionByCardId("dz7PxEsp",function(data){
	//console.log(data);
});

g.getAttachmentByCardId("dz7PxEsp",function(data){
	//console.log(data);

});

g.getChecklistByCardId("dz7PxEsp",function(data){
	//console.log(data);

});

g.getOrganizationId("saber_syana",function(data){
	//console.log(data);
		/*	var fs = require('fs');
		fs.writeFile('cardData.txt', data, function (err) {
	  		if (err) throw err  		
	});	*/

});
/*
//organizatinId:556dc1b61fadc40cfea39213 syana
g.addBoardToOrganization("Board name","board description","556dc1b61fadc40cfea39213",function(data){
	//console.log(data);

});

//boardid:556dc2a41d0c5fe08a8f252c my board
g.addListToBoard("A new List by nodejs","556dc2a41d0c5fe08a8f252c",function(data){
	//console.log(data);

});

g.addCardToList("this is a new card","Here is some description","556dc2b19a1530133a568421",function(data){
	//console.log(data);

});

g.moveCardToList("556dc2b19a1530133a568421","a9lGQ2gJ",function(data){
	//console.log(data);

});

g.commentCard("Testing comment!","a9lGQ2gJ",function(data){
	//console.log(data);

});

g.copyCardToList("556db0f11b3022288b2a07e8","5580e574620d681d25fb2425",function(data){
	//console.log(data);

});
*/
//cardname:copyto
/*
var t = new Trello(appkey,token);
t.post("/1/tokens/"+token+"/webhooks"+, {
  key: appkey,
  idModel: "5577d178fc0b005479e9bd9f",
  description:"this is a description",
  callbackURL: "http://{YOUR_DOMAIN}/callback?{any_parameters_you_want_append}",

},function(err,data){
	if(err) throw err
	console.log(data)
});*/


//http -v POST https://trello.com/1/tokens/{OAUTH_TOKEN}/webhooks/\?key\={APP_KEY}   idModel={BOARD_ID} description='{custom_description}' callbackURL='http://{YOUR_DOMAIN}/callback?{any_parameters_you_want_append}'






