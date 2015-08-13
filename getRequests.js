var Trello = require("node-trello");
var winston     = require('winston');

var t = null;
var GetRequests = module.exports = function (key,token) {
	 t = new Trello(key,token);
};

GetRequests.prototype.getBoardId = function(callback){
	t.get('/1/members/me',{boards:"all",board_fields:"name"},function(err, data) {    		
	if (err) throw err;								  
	callback(JSON.stringify(data));
	})
}

GetRequests.prototype.getListByBoardId = function(boardid,callback){
	t.get('/1/boards/'+boardid,{lists:"all",list_fields:"all"},function(err, data) {    		
	if (err) throw err;								  
	callback(JSON.stringify(data));
	})
}

GetRequests.prototype.getCardByListId = function(listid,callback){
	t.get('/1/lists/'+listid,{cards:"all",card_fields:"all"},function(err, data) {    		
	if (err) throw err;								  
	callback(JSON.stringify(data));
	})
}

GetRequests.prototype.getActionByCardId = function(cardid,callback){
	t.get('/1/cards/'+cardid+'/actions',{filter:"all",limit:1000,entities:true,display:true},function(err, data) {    		
	if (err) {
		winston.log( 'debug', '[getActionByCardId] ', err);
		callback();
		return;
	}		
	var strDada = JSON.stringify(data);
	var fs = require('fs');
		fs.writeFile('cardData.txt', strDada, function (err) {
	  		if (err) throw err  	
	});						  
	callback(strDada);
	})
}

GetRequests.prototype.getAttachmentByCardId = function(cardid,callback){
	t.get('/1/cards/'+cardid+'/attachments',{},function(err, data) {    		
	if (err) throw err;								  
	callback(JSON.stringify(data));
	})
}

GetRequests.prototype.getChecklistByCardId = function(cardid,callback){
	t.get('/1/cards/'+cardid,{checklist:true,checklist_fields:"all"},function(err, data) {    		
	if (err) throw err;								  
	callback(JSON.stringify(data));
	})
}

GetRequests.prototype.getOrganizationId = function(organizationName,callback){
	t.get('/1/organizations/'+organizationName,{},function(err, data) {    		
	if (err) throw err;							  
	callback(JSON.stringify(data));
	})
}
//not yet
GetRequests.prototype.addBoardToOrganization = function (name, description, organizationId, callback) {
	t.post('/1/boards/',{name:name,description:description,organizationId:organizationId},function(err, data) {    		
	if (err) throw err;								  
	callback(JSON.stringify(data));
	})
};

GetRequests.prototype.addListToBoard = function(name,boardId, callback){
	t.post("/1/boards/" + boardId + "/lists",{name:name},function(err, data) {    		
	if (err) throw err;								  
	callback(JSON.stringify(data));
	})
}

GetRequests.prototype.addAttachmentToCard = function(cardStr, callback){
	var card = JSON.parse(cardStr)
//	console.log("-----------------"+card.id+card.name+card.url)
	t.post("/1/cards/" + card.id + "/attachments",{name:card.name,url:card.url,file:card.file,mimeType:card.mimeType},function(err, data) {    		
	if (err) {
		winston.log( 'debug', '[addAttachmentToCard] ', err);
		callback();
		return;
	}								  
	callback(JSON.stringify(data));
	})
}

GetRequests.prototype.addCardToList = function(name, description, listId, callback){
	t.post('/1/cards/',{name:name,desc:description,idList:listId},function(err, data) {    		
	if (err) throw err;								  
	callback(JSON.stringify(data));
	})
}

GetRequests.prototype.moveCardToList = function(listid,cardid,callback){
	t.put('/1/cards/'+cardid+'/idlist',{value:listid},function(err, data) {    		
	if (err) throw err;								  
	callback(JSON.stringify(data));
	})
}

GetRequests.prototype.commentCard = function(comments,cardid,callback){
	t.post('/1/cards/'+cardid+'/actions/comments',{text:comments},function(err, data) {    		
	if (err) {
		winston.log( 'debug', '[commentCard] ', err);
		callback();
		return;
	}							  
	callback(JSON.stringify(data));
	})
}

GetRequests.prototype.copyCardToList = function(listid,cardid,callback){
	t.post('/1/cards/',{idList:listid,due:null,idCardSource:cardid},function(err, data) {    		
	if (err) throw err;							  
	callback(JSON.stringify(data));
	})
}

//https://trello.com/c/2wbdUWma
