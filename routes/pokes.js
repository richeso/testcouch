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
			table: 'monsters',
			"_id": "pikachu",
		    name: 'pikachu', 
		    skills: ['thunder bolt', 'iron tail', 'quick attack', 'mega punch'], 
		    type: 'electric' 
		},
	    { 
			table: 'monsters',
			"_id": "bulbosaur",
		    name: 'bulbosaur', 
		    skills: ['lightning fire', 'thunder stomp', 'quick kill', 'super punch'], 
		    type: 'grass' 
		},
	    { 
			table: 'monsters',
			"_id": "weedle",
		    name: 'weedle', 
		    skills: ['grass fire', 'herbal stomp', 'quick greening', 'super pull'], 
		    type: 'herb' 
		},
	    { 
			table: 'monsters',
			"_id": "bull",
		    name: 'bull', 
		    skills: ['cow stampede', 'lift off', 'mega horn', 'moo'], 
		    type: 'herb' 
		},
		{ 
			table: 'monsters',
			"_id": "ivysaur",
		    name: 'ivysaur', 
		    skills: ['lightning strike', 'crumbly stomp', 'quick kill', 'super punch'], 
		    type: 'poison' 
		} 
		];
	   
	   for(var i in data) {    
		    insertDB(data[i], handleCB);
	   }
		
	   // output database info to the console 
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

exports.findById = function(req, res) {
	 var id = req.params.id;
	 console.log("looking for: "+id)
     db.get(id, function (error, existing) { 
 	  if(!error) {
 		  res.send(existing);
 		  console.log("Retrieved: " + id + " ---> " + existing);
 	  }
	  });
};

exports.findByType = function(req, res) {
	var type = req.params.type;
	db.view('pokemon', 'by_type', {'key': type, 'include_docs': false}, function(err, body){
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
 
	db.view('pokemon', 'by_name', {'key': name, 'include_docs': false}, function(err, body){
	    if(!err){
	    	console.log("retrieved by name: "+name);
	    	res.send(body);
		    body.rows.forEach(function(doc) {
		      console.log(doc);
		    });
	    }
	    
	    });
};

// use the default find all
exports.findAll = function(req, res) {
	db.list({startkey:'', 'include_docs': true, limit:20}, function(err, body) {
		  if (!err) {
			res.send(body);
		    body.rows.forEach(function(doc) {
		      console.log(doc);
		    });
		  }
		});
};

// use the view - filter all
exports.viewAll = function(req, res) {
	db.view('pokemon', 'all', {'include_docs': false}, function(err, body){
	    if(!err){
	    	console.log("retrieved by view: all");
	    	res.send(body);
		    body.rows.forEach(function(doc) {
		      console.log(doc);
		    });
	    }
	    
	    });
};
exports.addPoke = function(req, res) {
    var poke = req.body;
    var pokestr = JSON.stringify(poke);
    console.log('Adding Pokemon: ' + pokestr);
    db.insert(poke, function(err, body) {
    	  if (!err) {
    	    console.log("inserted: " +pokestr);
    	    res.send(body);
    	  } else res.send(err);
    });
}

db.update = function(obj, key, callback) {
	 var db = this;
	 db.get(key, function (error, existing) { 
	  if(!error) {
		  obj._rev = existing._rev;
		  db.insert(obj, key, callback);
	  }
	    
	 });
};

exports.updatePoke = function(req, res) {
	var poke = req.body;
	var pokestr = JSON.stringify(poke);
    console.log('Updating Poke: ' + poke.name);
    db.update(poke, poke.name , function(err, result) {
    	 if (err) {
    		 return console.log('Error during update!');
    		 res.send(err);
    	 } else {
    		 console.log('Updated! '+poke);
    		 res.send(result);
    	 }
    	 
    });
}

exports.deletePoke = function(req, res) {
      var id = req.params.id;
      db.get(id, function (error, existing) { 
  	  if(!error) {
  		  var rev = existing._rev;
  	      console.log('Deleting Poke: ' + id + ' and Rev: '+rev);
  		  db.destroy(id, rev, function(err, body) {
  			  if (!err) {
  			    console.log(body);
  			    res.send(body);
  			  } else {
  				  res.send(err);
  			  }
  		  });
  	  }
  	 });
}

