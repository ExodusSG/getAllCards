var async       = require("async"); 
var Trello      = require("node-trello");
var getRequests = require("./getRequests");
var dateFormat  = require('dateformat');
var yaml        = require('js-yaml');
var fs          = require('fs');
var mongo       = require('mongoskin');
var MongoClient = mongo.MongoClient;
var winston 	= require('winston');
var request 	= require('request');
var TrelloMsg_db = mongo.db("mongodb://localhost:27017/MsgDB/data", {native_parser:true});

winston.add(winston.transports.File, { filename: 'mylogfile.log', level: 'debug' });

//winston.log( 'debug', 'This is the beginning of process getAllCards. ');
//winston.log( 'warn', 'This is the beginning of process getAllCards. ');
//winston.log( 'error', 'This is the beginning of process getAllCards. ');
//winston.log( 'debug', 'This is the beginning of process getAllCards. ');

//initialization
var mongourl = null;
var appkey   = null;
var token    = null;
try {
    var doc = yaml.safeLoad(fs.readFileSync('config.yml', 'utf8'));
    mongourl = doc.mongodburl;  
    appkey = doc.appKey;
    token = doc.oauthToken;
} catch (e) {
    winston.log( 'debug', e);
//    console.log(e);
    return;
}

var g = new getRequests(appkey,token);
var count = 0;
//connect to database
var _db = MongoClient.connect(mongourl);

async.whilst(
    function () { return true; },    
        function (callback) {
        count++;
        if ( count % 120 === 0) {
            winston.log( 'debug', 'count: ', count );
        }
        setTimeout(callback, 5000);
//      console.log(Jcards.length);  

 
        var collection = _db.collection('data');

        
        collection.find({}).toArray(function (err, result) {
        var Jcards=JSON.parse(JSON.stringify(result));
        for(var i=0; i < Jcards.length; ++i) {
            var vid=Jcards[i]._id;
//            console.log(vid)
            pollingCards(Jcards[i]);
            }
        });

        },
    function (err) {
        // 5 seconds have passed
        if ( err) {
            winston.log( 'debug', 'Getting Card loop has error here!!!');
        }
    }//end of function
    );

function pollingCards(card){
var lid = card.srcID;
var targetID = card.dupID;
var _id = card._id;
if(lid == null || targetID ==null)
    return;
g.getActionByCardId(lid,function(data){
	if ( typeof(data) === 'undefined' ) {
            winston.log( 'debug', 'getActionByCardID function  has error here!!!');
	    return; // return without doing anything
	}
            obj = JSON.parse(data)
            var counter = obj.length-1;
            var obj1 = {};
            for(var key in obj){
                obj1[counter] = obj[key];
                counter--;
            }
            
//            console.log(obj1);
            async.each(obj1,
                  // 2nd param is the function that each item is passed to
                  function(item, callback){
                    //request database
                    var collection = _db.collection('data');
                    //find the time if not found create a new time
                    collection.findById(_id,function (err, doc) {
                        //console.log(doc);
//                        console.log("The 1st time is "+lastTime);
                        var lastTime = new Date();
                        if(doc.lastUpdatingTime != null && doc.lastUpdatingTime != "")
                        {
                            lastTime = new Date(doc.lastUpdatingTime)
//                            console.log("Time matched    "+lastTime); 
                        } 
                        else
                        {
//                            console.log("empty");
                            doc.lastUpdatingTime = lastTime;
                            collection.updateById(_id,doc,function (err, doc) {

                            })                            
                        }               
//                    console.log("The 2nd time is "+lastTime);
                    dateFormat(lastTime, "isoDateTime");
                    var rTime = new Date(item.date);
                    dateFormat(rTime, "isoDateTime");
                    lastTime.setSeconds(lastTime.getSeconds() + 1);
//                    console.log(rTime>lastTime);
                    if(rTime>lastTime){
                        switch (item.type) {
                            //for comment card
                            case 'commentCard':
                                    var commentContains = item.memberCreator.fullName+" commented: "+item.data.text;
//                                    g.commentCard(commentContains,targetID,function(data){
//					if ( typeof(data) === 'undefined' ) {
//            					winston.log( 'debug', 'commentCardD function[1] has error here!!!');
//					} else {
//                                        console.log(data);
//					}
//                                    });
				    TrelloMsgExtracting(item, doc);
                                    break;
                            case 'updateCard':                                    
                                    break;  
                            //for attachment
                            case 'addAttachmentToCard': 
                                    var commentContains = item.memberCreator.fullName+" attached a file: "+item.data.attachment.name;
                                    g.commentCard(commentContains,targetID,function(data){
					if ( typeof(data) === 'undefined' ) {
            					winston.log( 'debug', 'commentCardD function[2] has error here!!!');
					} else {
//                                        console.log(data);
					}
                                    });
                                    var card = '{"id":"'+targetID+
                                                '","name":"'+item.data.attachment.name+
                                                '","url":"'+item.data.attachment.url+'"}';
//                                    console.log("-----------------attachment found--------------")                                                                                    
                                    g.addAttachmentToCard(card,function(data){
					if ( typeof(data) === 'undefined' ) {
            					winston.log( 'debug', 'addAttachmentToCard function[2] has error here!!!');
					} else {
//                                        console.log(data);
					}
                                    })                                   
                                    break;                        
                        }
                        //after different get requests
//                        console.log("rTime:       "+rTime);
//                        console.log("latestRecord "+lastTime);
                        doc.lastUpdatingTime = rTime;
                        collection.updateById(_id,doc,function (err, doc) {

                        })                                        
                    }
                    else{
                        callback();
                        return;
                    }
                    });//end of findbyid                
                  },
                  // 3rd param is the function to call when everything's done
                  function(error){
                    // All tasks are done now
                    if(error)
                    {
//                        console.log("there was an error")               
                        winston.log( 'debug', 'Getting card actions has error here! ' );
                    }
//                    console.log("--------------End-----------------")
                    }//end of alldone function
                );
            });
}

function TrelloMsgExtracting(card, doc) {
    var Msg_date = new Date(card.date);
    var Msg_year = Msg_date.getFullYear();
    var Msg_month = Msg_date.getMonth();
    var Msg_day = Msg_date.getDate();
    var Msg_year_str = Msg_year.toString();
    var Msg_month_str = (Msg_month >=9 )? (Msg_month+1).toString(): "0"+(Msg_month+1).toString();
    var Msg_day_str = (Msg_day >9 )? Msg_day.toString(): "0"+ Msg_day.toString();
    var TrelloMsg_collection= "TrelloMsg_"+Msg_year_str+"_"+Msg_month_str+"_"+Msg_day_str;
    //console.log("TrelloMsg_collection Name: " + TrelloMsg_collection);

    var TrelloMsg = {
        "db_name": "MsgDB",
        "collection_name": TrelloMsg_collection,
        "primary_key": mongo.ObjectID(),
        "msg_timestamp": Date(),
        "msg_originator": card.memberCreator.fullName,
        "msg_group": "ExodusSG",
        "msg_reference": doc.srcID,
        "msg_content": card.data.text,
        "source_signature": "trello"
    };
    TrelloMsg._id = TrelloMsg.primary_key;
    //console.log(TrelloMsg);
    
    /* Now insert this message into MongoDB message collection */
    db = TrelloMsg_db;
    db.createCollection(TrelloMsg.collection_name,function(err, result) {
        if (err) {
        	console.log(err);
            return; /* cannot create this collection */
        }
        console.log("create result "+result);

	    var collection = db.collection(TrelloMsg.collection_name);
	    collection.insert(TrelloMsg, function(err, result) {
	        if (err) {
	            console.log(err);
	            return;
	        }
	        //console.log("INSERT result"+JSON.stringify(result));
	        if(TrelloMsg.msg_originator != doc.msg_requestor) { return; }
        	console.log("Now we need to send http get to rule engine.");
        	//Lets try to make a HTTP GET request to rule engine's website.
        	var url = "http://localhost:3000/trello?" + "collection="+TrelloMsg.collection_name+
        		"&msgid="+TrelloMsg.primary_key;
        	console.log("The url is: "+ url);
        	request(url, function (error, response, body) {
        	    if (!error && response.statusCode == 200) {
        	        console.log(body); // Show the HTML for the Modulus homepage.
        	    }
        	});
	    });
    });
}
