var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.raw());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));
var AWS = require("aws-sdk");
AWS.config.update({region: "us-east-1"});

//get all items
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



//add new address
router.post('/', function(req, res) {
	console.log(req.body);
	var ddb = new AWS.DynamoDB.DocumentClient();
	var add_id = req.body.Address_id;
	var params = {
		TableName : 'AddressTable',
		Item: req.body,
		'ConditionExpression':'attribute_not_exists(Address_id)',
	};
	ddb.put(params, function(err, data) {
		if (err) {
			console.log(err);
			res.end();
		}
		else {
			console.log(data);
			res.end();
		}
	});
});


//get address by id
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

//add person to existing address id or delete person from existing address id
router.put('/:add_id/', function(req, res) {
	var ddb = new AWS.DynamoDB.DocumentClient();
    var add_id = req.params.add_id;
    var Delete = req.body.Delete;
    Name = req.body.Persons;
    if(Delete=='true'){
		var params = {
		    TableName:"AddressTable",
		    Key:{
		        "Address_id": add_id,
		    },
			'UpdateExpression' : "SET Persons = list_append(Persons, :toAddName)",
			'ConditionExpression': "not contains (Persons, :toAddNameMap)",		
			'ExpressionAttributeValues' : {
		        ":toAddName": Name,
		        ":toAddNameMap" : Name[0]
			}
		};
		ddb.update(params, function(err, data) {
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
    else{
		var params = {
		    TableName:"AddressTable",
		    Key:{
		        "Address_id": add_id,
		    },
			'UpdateExpression' : "SET Persons = list_append(Persons, :toAddName)",
			'ConditionExpression': "not contains (Persons, :toAddNameMap)",		
			'ExpressionAttributeValues' : {
		        ":toAddName": Name,
		        ":toAddNameMap" : Name[0]
			}
		};
		ddb.update(params, function(err, data) {
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

});

//delete address id
router.delete('/:add_id/', function(req, res) {
	var ddb = new AWS.DynamoDB.DocumentClient();
    var add_id = req.params.add_id;

	var params = {
	    TableName : 'AddressTable',
	    Key: {
	      Address_id: add_id,
	    }
	};

	ddb.delete(params, function(err, data) {
	    if (err) {
	    	console.log(err);
	    	res.end();
	    }
	    else {
	    	console.log(data);
	    	res.end()
	    }
	});  
});




// get persons under the address id
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

