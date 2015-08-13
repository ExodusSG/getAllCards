var async = require("async"); 
var Trello = require("node-trello");
var getRequests = require("./getRequests");
var dateFormat = require('dateformat');

var appkey = 'yourappkey';
var token = 'yourtoken';

var g = new getRequests(appkey,token);
var fs = require('fs');
var cards = fs.readFileSync('/nodejs/cards.txt');
var Jcards = JSON.parse(cards);

var count = 0;
async.whilst(
    function () { return true; },    
        function (callback) {
        count++;
        setTimeout(callback, 5000);
        //console.log(Jcards.length);  
        for(var i=0; i < Jcards.length; ++i) {
            pollingCards(Jcards[i]);
        }

        },
    function (err) {
        // 5 seconds have passed
    }//end of function
    );

function pollingCards(card){

g.getActionByCardId(card.listeningCardID,function(data){
            obj = JSON.parse(data)
            var counter = obj.length-1;
            var obj1 = {};
            for(var key in obj){
                obj1[counter] = obj[key];
                counter--;
            }
            
            //console.log(obj1);
            async.each(obj1,
                  // 2nd param is the function that each item is passed to
                  function(item, callback){

                    var lastTimetxt = fs.readFileSync('/nodejs/cards.txt');
                    var Jlast = JSON.parse(lastTimetxt);
                    var lastTime = new Date();
                    console.log("The 1st time is "+lastTime);
                    for(var i=0; i < Jlast.length; ++i) {
                        if(Jlast[i].listeningCardID == card.listeningCardID)
                        {
                            //console.log(Jlast[i].lastUpdateTime);
                            if(Jlast[i].lastUpdateTime != null && Jlast[i].lastUpdateTime != "")
                                {
                                    lastTime = new Date(Jlast[i].lastUpdateTime)
                                    console.log("Time matched    "+lastTime); 
                                } 
                            else{
                                console.log("empty");
                                Jlast[i].lastUpdateTime = lastTime;
                                fs.writeFileSync('/nodejs/cards.txt', JSON.stringify(Jlast));
                            }                           
                            break ;
                        }                       
                    }              

                    console.log("The 2nd time is "+lastTime);
                    dateFormat(lastTime, "isoDateTime");
                    var rTime = new Date(item.date);
                    dateFormat(rTime, "isoDateTime");
                    lastTime.setSeconds(lastTime.getSeconds() + 1);
                    console.log(rTime>lastTime);
                    if(rTime>lastTime){
                        var commentContains = item.memberCreator.fullName+" commented: "+item.data.text;
                        g.commentCard(commentContains,card.duplicatedCardID,function(data){
                            console.log(data);
                        });
                        console.log("rTime:       "+rTime);
                        console.log("latestRecord "+lastTime);
                        for(var i=0; i < Jlast.length; ++i) {
                            if(Jlast[i].listeningCardID == card.listeningCardID)
                            {
                                Jlast[i].lastUpdateTime = rTime;
                                break ;
                            }                       
                        }   
                        fs.writeFileSync('/nodejs/cards.txt', JSON.stringify(Jlast));                  
                    }
                    else{
                        callback();
                        return;
                    }
                    callback();
                    //console.log("lasttime is"+lastTime);
                    //console.log(item.date>lastTime);
                  },
                  // 3rd param is the function to call when everything's done
                  function(error){
                    // All tasks are done now
                    if(error)
                    {
                        console.log("there was an error")               
                    }
                    console.log("--------------End-----------------")
                    }//end of alldone function
                );
            });
}
