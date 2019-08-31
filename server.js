var express = require('express');
var app = express();
var mongoClient = require('mongodb').MongoClient;
var url = 'mongodb+srv://jake:jake@cluster0-mv99y.mongodb.net/test?retryWrites=true&w=majority';
var dbname = "adb";
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use(function(req,res,next){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.use(express.static(__dirname + '/views/www'));
console.log(__dirname + '/views/www');
app.set('view engine', 'ejs');
var nodemailer = require('nodemailer');
var request = require('request-promise');
var session = require("express-session");
var sess = {
	secret: 'rannz',
	user: {"username":"", "email":"", "password": "", "fullname": "" ,balance: 0}
};

var obj = {
	user:[{
	}]
}

app.use(session(sess));


function sendEmail(userEmail, amount, date, merchant){

	console.log("Data is " +userEmail+ amount+ date+ merchant)
	let transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
		auth: {
			user: 'ipayx2@gmail.com',
			pass: 'Ipayx231234'
		}
	});

	let mailOptions = {
		from: '"IpayX <ipayx@gmail.com>"',
		to: userEmail, 
		subject: "Transaction Receipt",
		text: " You have paid " +amount+ " to " +merchant+ " on " +date
	};


	transporter.sendMail(mailOptions, (error, info) =>{
		if(error){
			console.log(error);
		}

		console.log("Success!");
	});
}

//Knack API call
async function getByNumber(){
	var options = {
			method: 'GET',
			uri:'https://api.knack.com/v1/objects/object_14/records',
			headers: {
				'Content-Type':'application/json',
				'X-Knack-Application-Id':'5d67ea69bbd32c0010f5f2e4',
				'X-Knack-REST-API-Key':'bd98d040-ca6f-11e9-aac3-ab1776568e57'
			}
		};

		var something = request(options).then(function(parsedBody){
			return parsedBody;
		}).catch(function(err){
			console.log("Parse errors:" +err);
		});

	return something;
}

//Time interval setter
async function wait(ms){
	return new Promise(resolve=>{
		setTimeout(resolve,ms);
	})
}

app.get('/', function(req, res){
	// async function init(){
	// 	var i = 0;
	// 	var chk = true;

	// 	while(chk){
	// 		i++;
	// 		await wait(2000+(i*500));

	// 		getByNumber().then(function(val){
	// 			val = JSON.parse(val);
	// 			var x = 0;

	// 			while(x < val.records.length){
	// 				var exists = false;
	// 				var index = 0;
					
	// 				if(obj.user.find(t=> t.id == val.records[x].id)){
	// 					obj.user.find(t=> t.id == val.records[x].id).balance = val.records[x].field_164_raw;
	// 					x++;
	// 				}else{
	// 					obj.user.push(val.records[x]);
	// 					x++;
	// 				}

	// 				console.log("OBJ HERE: " + JSON.stringify(obj.user));	
	// 			}
	// 		});
	// 	}
	// }

	// init();

	res.render('www/index.html');
});


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
					sess.user.fullname = result[i].firstname + ' ' + result[i].lastname;
					sess.user.email = result[i].email;
					chk = true;
				}
			}

			if(chk == true){
				ret = "Success!";
				res.send("1");
			}else{
				res.send("0");
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

app.post('/verifyFace', function(req, res){
	mongoClient.connect(url, function(err, db){
		if(err) console.log(err);
		
		var database = db.db(dbname);

		collection = database.collection("users");
		var username = req.body.username;

		collection.find().toArray(function(err, result){
			if(err) throw err;

			var length = Object.keys(result).length;
			var chk = false;

			for(var i = 0; i < length; i++){
				if(result[i].username == username){
					chk = true;
				}
			}

			if(chk == true){
				ret = "Success!";
				res.send("1");
			}else{
				res.send("0");
			}
		
		});	

		db.close();
	});
});

app.post('/transaction', function(req, res){
var date = new Date();
var today = date.getFullYear()+'-'+(("0" + (date.getMonth() + 1)).slice(-2))+'-'+date.getDate();
console.log("a lot of random stuff but this is current session");
console.log(sess.user.username);
mongoClient.connect(url, function(err, db,callback){
database = db.db(dbname);
collection = database.collection("users");
transaction = database.collection("transactions");

var obj = {
'username':sess.user.username, 
'deduct': parseInt(req.body.amount),
'email':sess.user.email
};

var ins = {
'buyer': obj.username,
'seller': req.body.seller, //change to req.body.seller when you add another form to the amount section with qr code
'transaction': obj.deduct,
'transactionType': 'Sales',
'date': today
};

collection.findOneAndUpdate({'username':obj.username}, {$inc: {"balance": -(obj.deduct)}});

collection.findOneAndUpdate({'username':ins.seller}, {$inc: {"balance": obj.deduct}});

//insert transaction to both user and seller

//inserts the current transaction

transaction.insertOne(ins, function(err, result){
	if(err){
		console.log(err);
	}

	sendEmail(obj.email, obj.deduct, today, ins.seller);

	mongoClient.connect(url, function(err, db2){
		var db2 = db2.db(dbname);
		var collection2 = db2.collection("users");
		collection2.updateOne({'username':obj.username, 'password':obj.password}, 
		{
			$push: {
				transactions: result.ops[0]._id
			}
		}

		);	
		
		console.log("updated buyer");
		mongoClient.connect(url, function(err, db3){
		console.log("meh")
		var db3 = db3.db(dbname);
		var collection3 = db3.collection("users");
		collection3.updateOne({'username':ins.seller}, 
		{
			$push: {
				transactions: result.ops[0]._id
			}
		}
		);	
		console.log("updated seller");
		db.close();
		res.send("success");

			
	})
			
	})
});
 });
});

//api getters 

app.get('/getData', function(req, res){
	res.send(sess.user);
});
//routers

app.get('/register', function(req, res){
	res.render('www/register.ejs');
});

app.get('/amount', function(req, res){
	res.render('www/amount.ejs');
});

app.get('/homeRedirect', function(req, res){
	res.render('www/home.ejs');
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


app.listen(8080);