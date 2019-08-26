var express = require('express');
var app = express();
var mongoClient = require('mongodb').MongoClient;
var url = 'mongodb+srv://rannzel:tongco231@cluster0-mv99y.mongodb.net/test?retryWrites=true&w=majority';
var dbname = "adb";

function insert(obj){
	mongoClient.connect(url, function(err, db){
		if(err) console.log(err);
		
		var database = db.db(dbname);
		collection = database.collection("data");

		collection.insert(obj, function(err, resu){
			if(err){
				console.log(err);
			}

			console.log("Result: " +JSON.stringify(resu));
		});

		db.close();
	});
}

async function view(){
	mongoClient.connect(url, function(err, db){
		if(err) console.log(err);
		
		database = db.db(dbname);
		collection = database.collection("data");

		var promise = new Promise(function(resolve, reject){
			collection.find().toArray(function(err, result){
				if(err) throw err;

				console.log("Res here" +JSON.stringify(result));
				resolve(result);
			});	
		});

		promise.then(function(res){
			return res;
		});		

		db.close();
	});
}


app.get('/insert', function(req, res){
	var obj = {
			'test':'wack',
			'yeet':'yo'
		};

	insert(obj);
});

app.get('/view', function(req, res){
	async function init(){
		var result = await view();

		console.log("Result is: " +JSON.stringify(result));
		
	}
	
	init();
});


app.listen(3000);