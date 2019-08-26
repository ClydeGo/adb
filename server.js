var express = require('express');
var app = express();
var mongoClient = require('mongodb').MongoClient;
var url = 'mongodb+srv://rannzel:tongco231@cluster0-mv99y.mongodb.net/test?retryWrites=true&w=majority';
var dbname = "adb";

app.get('/insert', function(req, res){
	mongoClient.connect(url, function(err, db){
		if(err) console.log(err);
		
		var database = db.db(dbname);
		collection = database.collection("user");

		var obj = {
			'test':'wack',
			'yeet':'yo'
		};

		collection.insert(obj, function(err, resu){
			if(err){
				console.log(err);
			}

			console.log("Result: " +JSON.stringify(resu));
		});

		db.close();
	});
});

app.get('/view', function(req, res){
	mongoClient.connect(url, function(err, db){
		if(err) console.log(err);
		
		database = db.db(dbname);
		collection = database.collection("user");

		collection.find().toArray(function(err, result){
			if(err) throw err;

			console.log("Result is: "+ JSON.stringify(result));
		});	

		db.close();
	});
});

app.get('/login', function(req, res){
	mongoClient.connect(url, function(err, db){
		if(err) console.log(err);
		
		var database = db.db(dbname);
		collection = database.collection("users");
		var username = "rannzchick";
		var password = "wayMae";
		collection.find().toArray(function(err, result){
			if(err) throw err;

			var length = Object.keys(result).length;

			console.log(length);

			for(var i = 0; i < length; i++){
				if(result[i].username == username && result[i].password == password){
					chk = true;
				}
			}
			

			if(chk == true){
				ret = "Success!";
				console.log("Successfully Logged In");
			}

		
		});	

		db.close();
	});
});

app.get('/register', function(req, res){
	mongoClient.connect(url, function(err, db){
		if(err) console.log(err);
		
		database = db.db(dbname);
		collection = database.collection("users");

		var obj = {
			'username':'clyde',
			'password':'insik',
			'email':'insik@gmail.com',
			'balance':0,
			'transactions':[]
		};

		collection.insert(obj, function(err, resu){
			if(err){
				console.log(err);
			}

			// res.render("login.ejs");
		});

		db.close();
	});
});

app.get('/addBalance', function(req, res){
	mongoClient.connect(url, function(err, db){
		if(err) console.log(err);
		
		database = db.db(dbname);
		collection = database.collection("users");
		transaction = database.collection("transactions");

		var obj = {
			'username':'clyde',
			'password':'insik',
			'add': 200
		};

		var seller = {
			'name':'Jollibee'
		};


		//add id generator later

		var ins = {
			'transactionId': 1234,
			'buyer': obj.username,
			'transaction': obj.add,
			'transactionType': 'TopUp'
		};

		collection.findOneAndUpdate({'username':obj.username, 'password':obj.password}, {$inc: {"balance": obj.add}});
		
	
		transaction.insert(ins, function(err, result){
			if(err){
				console.log(err);
			}

			collection.update(
			{'username':obj.username, 'password':obj.password}, 
			{
				$push: {
					transactions: result.ops[0]._id
				}
			}
		);

		});


		db.close();
	});
});

app.get('/subtractBalance', function(req, res){
	mongoClient.connect(url, function(err, db){
		if(err) console.log(err);
		
		database = db.db(dbname);
		collection = database.collection("users");

		var obj = {
			'username':'rannzchick',
			'password':'wayMae',
			'oldBalance':1300,
			'deduct':200
		};

		var  newBalance = (obj.oldBalance - obj.deduct);
		console.log(newBalance);
		collection.findOneAndUpdate({'username':obj.username, 'password':obj.password}, {$inc: {"balance": -(obj.deduct)}});


		//add seller function here
		//insert transaction to both user and seller

		db.close();
	});
});




app.listen(3000);