var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.raw());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));
var AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1"
});

router.get('/', function (req, res) {
	res.write('root');
	res.end();
});



router.get('/Addresses/', function(req, res) {
	var ddb = new AWS.DynamoDB.DocumentClient();	
	var params = { 
	  	TableName: "AddressTable"
	};
	ddb.scan(params, function(err, data) {
   		if (err) console.log(err, err.stack); // an error occurred
	    else {
	    	res.send(data);	
	    	res.end();
	    }

	}); 
});

router.post('/Addresses/', function(req, res) {
	console.log(req.body);
	var ddb = new AWS.DynamoDB.DocumentClient();
	var params = {
		TableName : 'AddressTable',
		Item: req.body
	};

	ddb.put(params, function(err, data) {
	  if (err) console.log(err);
	  else console.log(data);
	});
});


router.get('/Addresses/:add_id/', function(req, res) {
	var ddb = new AWS.DynamoDB.DocumentClient();
    var add_id = req.params.add_id;
	var params = {
	  TableName : 'AddressTable',
	  Key: {
	    Address_id: '1'
	  }
	};	 		
	ddb.get(params, function(err, data) {
	    if (err) console.log(err, err.stack); // an error occurred
	    else {
	    	res.send(data);	
	    	res.end();
	    }
	});  
});

router.put('/Addresses/:add_id/', function(req, res) {
	var ddb = new AWS.DynamoDB.DocumentClient();
    var add_id = req.params.add_id;
	var params = {
	    TableName:"AddressTable",
	    Key:{
	        "Address_id": 5,
	    },
	    UpdateExpression: "set Persons = :r",
	    ExpressionAttributeValues:{
	        ":r":5.5,
	        ":p":"Everything happens all at once.",
	        ":a":["Larry", "Moe", "Curly"]
	    },
	    ReturnValues:"UPDATED_NEW"
	};

	console.log("Updating the item...");
	docClient.update(params, function(err, data) {
	    if (err) {
	        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
	    } else {
	        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
	    }
	});  
});


router.delete('/Addresses/:add_id/', function(req, res) {
	var ddb = new AWS.DynamoDB.DocumentClient();
    var add_id = req.params.add_id;
	var params = {
	  TableName : 'AddressTable',
	  Key: {
	    Address_id: '5',
	  }
	};

	ddb.delete(params, function(err, data) {
	  if (err) console.log(err);
	  else console.log(data);
	});  
});





router.get('/Addresses/:add_id/persons', function(req, res) {
	var ddb = new AWS.DynamoDB.DocumentClient();
    var add_id = req.params.add_id;
	var params = {
	  TableName : 'AddressTable',
	  Key: {
	    Address_id: add_id,
	  },
	  ProjectionExpression: 'Persons',	  
	};	 		
	ddb.get(params, function(err, data) {
	    if (err) console.log(err, err.stack); // an error occurred
	    else {
	    	res.send(data);	
	    	res.end();
	    }
	});  
});


module.exports = router;

