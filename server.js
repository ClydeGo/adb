var express = require('express');
var app = express();
var mongoClient = require('mongodb').MongoClient;
var url = 'mongodb+srv://rannzel:tongco231@cluster0-mv99y.mongodb.net/test?retryWrites=true&w=majority';
var dbname = "adb";
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.set('view engine', 'ejs');
var session = require("express-session");
var sess = {
	secret: 'rannz',
	user: {"username":"", "password": "", balance: 0}
};

app.use(session(sess));

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

app.get('/', function(req, res){
	res.render('www/index.ejs');
});

app.post('/login', function(req, res){
	mongoClient.connect(url, function(err, db){
		if(err) console.log(err);
		
		var database = db.db(dbname);
		collection = database.collection("users");
		var username = req.body.username;
		var password = req.body.password;

		collection.find().toArray(function(err, result){
			if(err) throw err;

			var length = Object.keys(result).length;
			var user = {"username": "", "password": ""};
			var chk = false;

			console.log("Res is "+ JSON.stringify(result));
			for(var i = 0; i < length; i++){
				if(result[i].username == username && result[i].password == password){
					sess.user.username = result[i].username;
					sess.user.password = result[i].password;
					sess.user.balance = result[i].balance;
					chk = true;
				}
			}

			if(chk == true){
				ret = "Success!";
				res.send({"res":"1"});
			}else{
				res.send({"res":"0"});
			}

		
		});	

		db.close();
	});
});

app.post('/register', function(req, res){
	mongoClient.connect(url, function(err, db){
		if(err) console.log(err);
		
		database = db.db(dbname);
		collection = database.collection("users");

		var obj = {
			'username':req.body.username,
			'password':req.body.password,
			'balance':0,
			'transactions':[]
		};

		collection.insert(obj, function(err, resu){
			if(err){
				console.log(err);
			}

			 res.send("Successfully Registered!");
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
			'add': 1500
		};

		var seller = {
			'name':'Jollibee'
		};


		//add id generator later
		var today = new Date();
		var date = today.getFullYear()+'-'+(("0" + (today.getMonth() + 1)).slice(-2))+'-'+today.getDate();
		console.log(date);
		var ins = {
			'buyer': obj.username,
			'transaction': obj.add,
			'transactionType': 'TopUp',
			'seller': seller.name,
			'date': date,
		};

		collection.findOneAndUpdate({'username':obj.username, 'password':obj.password}, {$inc: {"balance": obj.add}});
		
	
		transaction.insert(ins, function(err, result){
			if(err){
				console.log(err);
			}

			mongoClient.connect(url, function(err, db2){
				var db2 = db2.db(dbname);
				var collection2 = db2.collection("users");
				collection2.update(
					{'username':obj.username, 'password':obj.password}, 
					{
						$push: {
							transactions: result.ops[0]._id
						}
					}
				);	
			
			})
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

//routers

app.get('/register', function(req, res){
	res.render('www/register.ejs');
});

app.get('/homeRedirect', function(req, res){
	var user = sess.user;
	res.render('www/home.ejs', {user:user});
});

app.get('/topUp', function(req, res){
	res.render('www/top-up.ejs');
});

app.get('/transactionHistory', function(req, res){
	mongoClient.connect(url, function(err, db){
		if(err) console.log(err);
		
		var database = db.db(dbname);
		collection = database.collection("users");
		transactions = database.collection("transactions");
		var transactionList;

		collection.find().toArray(function(err, result){
			if(err) throw err;

			var length = Object.keys(result).length;
			var user = {"username": "", "password": ""};
			var chk = false;

			console.log("Session is " +JSON.stringify(sess.user));
			
			for(var i = 0; i < length; i++){
				if(result[i].username == sess.user.username && result[i].password == sess.user.password){
					transactionList = result[i].transactions;
				}
			}
		});	

		var finalTransactions = {
				transactions:[{

				}]
			};

		var promise = transactions.find().toArray(function(err, result){
			var x = transactionList.length - 1;
			var chkr;
			var y = 0;
			console.log(JSON.stringify(transactionList));
			while(x >= 0 &&	 y <= Object.keys(result).length){
				console.log(transactionList[x] +' '+ result[y]._id);

				if(transactionList[x].toString() == result[y]._id.toString()){
					finalTransactions.transactions.push(result[y]);
				}

				y++;

				if(y == Object.keys(result).length){
					y = 0;
					x--;
				}
			}

			
			transactions = finalTransactions.transactions;
			console.log("Mao ni " +JSON.stringify(transactions[1]));
			res.render("www/history.ejs", {transactions:transactions});
		});

		db.close();
	});
});


app.listen(3000);