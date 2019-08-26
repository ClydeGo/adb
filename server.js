var express = require('express');
var app = express();
var mongoClient = require('mongodb').MongoClient;
var url = 'mongodb+srv://rannzel:tongco231@cluster0-mv99y.mongodb.net/test?retryWrites=true&w=majority';
var dbname = "adb";

app.get('/insert', function(req, res){
	mongoClient.connect(url, function(err, db){
		if(err) console.log(err);
		
		var database = db.db(dbname);
		collection = database.collection("data");

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
		collection = database.collection("data");

		collection.find().toArray(function(err, result){
			if(err) throw err;

			console.log("Result is: "+ JSON.stringify(result));
		});	

		db.close();
	});
});


app.listen(3000);