var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.raw());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));
var AWS = require("aws-sdk");
AWS.config.update({region: "us-east-1"});


router.get('/', function(req, res) {
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



// add person to existing address or add new address
router.post('/', function(req, res) {
	console.log(req.body);
	var ddb = new AWS.DynamoDB.DocumentClient();

	var params_query = {
	    TableName: 'AddressTable',
	    KeyConditionExpression: 'Address_id = :add_id',
	    ExpressionAttributeValues: {
	        ':add_id': req.body.Address_id,
	    }
	};
	ddb.query(params_query, function(err, data) {
		if (err) console.log(err);
		else {
			console.log(data.Count);
	   		if (data.Count== '0'){
				var params_addNew = {
					TableName : 'AddressTable',
					Item: req.body
				};
				ddb.put(params_addNew, function(err, data) {
					if (err) console.log(err);
					else console.log(data);
				});
	   		}
	   		else{
			    toAddName = req.body.Persons;
				var params_addName = {
				    TableName:"AddressTable",
				    Key:{
				        "Address_id": req.body.Address_id,
				    },
					'UpdateExpression' : "SET Persons = list_append(Persons, :toAddName)",
					'ConditionExpression': "not contains (Persons, :toAddNameMap)",		
					'ExpressionAttributeValues' : {
				        ":toAddName": toAddName,
				        ":toAddNameMap" : toAddName[0]
					}
				};
				ddb.update(params_addName, function(err, data) {
				    if (err) {
				        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
				    	res.end();
				    } 
				    else {
				        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
				        res.end();
				    }
				});
	   		}
		}
	});
});



router.get('/:add_id/', function(req, res) {
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

router.put('/:add_id/', function(req, res) {
	var ddb = new AWS.DynamoDB.DocumentClient();
    var add_id = req.params.add_id;
	var params = {
	    TableName : 'AddressTable',
	    Key: {
	      Address_id: req.body.Address_id
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


router.delete('/:add_id/', function(req, res) {
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





router.get('/:add_id/persons', function(req, res) {
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

