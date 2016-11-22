  var request = require('request')

  var url   = 'http://localhost:5984/'
  var urldb = 'pokemon'
 
// don't forget to add your credentials if you are not in admin party mode!
  var nano = require('nano')('http://localhost:5984');
  var db_name = "pokemon";
  var db = nano.use(db_name);

/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
//*-------------------------------------------------------------------------------------------------------------------*/
var insertDB  = function(item, cb) {

	    db.insert(item, function(err, body){
	      var itemname = item.name;
		  if(!err){
		    cb(true," Insert of: " +itemname ,err,body);
		  } else {
			cb(false," Insert of: "+itemname ,err,body);
		  }
	    });
};

var handleCB = function (status,op,err,body) {
	if (status) {
		console.log(op+" Successfull !");
	} else {
		console.log(op+" Failed: "+err);
		console.log(body);
	}
}
var populateDB = function() {
	   var data = [ { 
		   "_id": "pikachu",
			table: 'monsters',
		    name: 'pikachu', 
		    skills: ['thunder bolt', 'iron tail', 'quick attack', 'mega punch'], 
		    type: 'electric' 
		},
	    { 
			"_id": "bulbosaur",
			table: 'monsters',
		    name: 'bulbosaur', 
		    skills: ['lightning fire', 'thunder stomp', 'quick kill', 'super punch'], 
		    type: 'grass' 
		},
		{ 
			"_id": "ivysaur",
			table: 'monsters',
		    name: 'ivysaur', 
		    skills: ['lightning strike', 'crumbly stomp', 'quick kill', 'super punch'], 
		    type: 'poison' 
		} 
		];
	   
	   for(var i in data) {    
		    insertDB(data[i], handleCB);
	   }
		
		nano.db.get('pokemon', function(err, body) {
			  if (!err) {
			    console.log(body);
			  } 
		});
		 
};
var createView = function() {
	 
		var viewdata = 
		{
			  "_id": "_design/pokemon",
			  "language": "javascript",
			  "views": {
			    "all": {
			      "map": "function(doc) {  if (doc.table == 'monsters') { emit(null, doc); } }"
			    },
			    "by_type": {
			      "map": "function(doc) {  if (doc.table == 'monsters') { emit(doc.type, doc); }  }"
			    },
			    "by_name": {
			      "map": "function(doc) {  if (doc.table == 'monsters') { emit(doc.name, doc); } }"
			    }
			   
			  }
		}
		db.insert(viewdata, function(err, body){
			  if(!err){
				  console.log("Design View created !!");
				  populateDB();
			  } else {
				  console.log("Error: Unable to create view !!");
				  console.log (body);
			  }
		});
	 
}

var createDB = function() {
	nano.db.create('pokemon', function(err, body) {
		  if (!err) {
		    console.log('database pokemon created!');
			createView();
		  }
		  else {
			  console.log("Error encountered creating db");
			  console.log(body);
		  }
		});
};

exports.checkDB  = function(req, res) {
	// If database does not exist, then create it
	nano.db.get('pokemon', function(err, body) {
		  if (!err) {
		    console.log ("Database Info:");
		    console.log ("--------------");
		    console.log(body);
		  } else {
			  createDB();
		  }
		});
};

var listDB = function() {
	nano.db.list(function(err, body) {
		  // body is an array
		  body.forEach(function(db) {
		    console.log(db);
		  });
		});
}

exports.findByType = function(req, res) {
	var type = req.params.type;
	db.view('_design/pokemon', 'by_type', {'key': type, 'include_docs': true}, function(err, body){
	    if(!err){
	    	console.log("retrieved by type: "+type);
	    	res.send(body);
		    body.rows.forEach(function(doc) {
		      console.log(doc);
		    });
	    }
	    
	    });
};


exports.findByName = function(req, res) {
	var name = req.params.name;
	db.view('_design/pokemon', 'by_name', {'key': name, 'include_docs': true}, function(err, body){
	    if(!err){
	    	console.log("retrieved by name: "+name);
	    	res.send(body);
		    body.rows.forEach(function(doc) {
		      console.log(doc);
		    });
	    }
	    
	    });
};
exports.findAll = function(req, res) {
	db.list({startkey:'', limit:3}, function(err, body) {
		  if (!err) {
			res.send(body);
		    body.rows.forEach(function(doc) {
		      console.log(doc);
		    });
		  }
		});
};

exports.addWine = function(req, res) {
    var wine = req.body;
    console.log('Adding wine: ' + JSON.stringify(wine));
    db.collection('wines', function(err, collection) {
        collection.insert(wine, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
}

exports.updateWine = function(req, res) {
    var id = req.params.id;
    var wine = req.body;
    console.log('Updating wine: ' + id);
    console.log(JSON.stringify(wine));
    db.collection('wines', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, wine, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating wine: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(wine);
            }
        });
    });
}

exports.deleteWine = function(req, res) {
    var id = req.params.id;
    console.log('Deleting wine: ' + id);
    db.collection('wines', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}

