var async = require("async"); 
var Trello = require("node-trello");

//change to your own appkey and token
var appkey = 'thisisyourappkey';
var token = 'thisisyourtoken';
var t = new Trello(appkey,token);

var myObj = {};
//Access the server 
t.get('/1/members/me',{boards:"all",board_fields:"name"},function(err, data) {
	if (err) throw err; 
	var str = JSON.stringify(data);
	if(data.boards==null){
		console.log("Can't read");
	}
	else{	
		async.each(data.boards,
		  // 2nd param is the function that each item is passed to
		  function(item, callback){
		    t.get('/1/boards/'+item.id,{cards:"all",actions:"all"},function(Cerr, Cdata) {
	    		var boardname = item.name;
	    		myObj[boardname] = Cdata;	    		
				if (Cerr) throw Cerr;	
				//callback
				callback();							
	    	});
		  },
		  // 3rd param is the function to call when everything's done
		  function(error){
		    // All tasks are done now
		    if(error)
		    {
				console.log("there was an error")		    	
		    }
		    else{
		    	var str = "";
				try{
					str = JSON.stringify(myObj);
				}catch(err){
					console.log(err);
				}
				console.log(myObj);	
				//save to file 		
				var fs = require('fs');
				fs.writeFile('UserJSON.txt', str, function (err) {
			  		if (err) return console.log(err);  		
				});
				}
			}//end of alldone function
		);
	}

//create a server
var http = require('http')
http.createServer(function(req,res){
	res.writeHead(200,{'Content-Type':'text/html'});
	res.write(str);
	res.end('');
}).listen(3000);
console.log('HTTP server is listening at port 3000.');
});
