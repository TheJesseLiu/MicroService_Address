var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.raw());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));
var AWS = require("aws-sdk");
AWS.config.update({region: "us-east-1"});
var baseURL = process.env.BASE_URL;

//get all items
router.get('/', function(req, res) {
	let ddb = new AWS.DynamoDB.DocumentClient();

    var params;
    var query = req.query;
    if (isQueryString(query)){

        var pairs = getKeyValuePairs(query);
        console.log(pairs);

        params = {
            TableName: "AddressTable",

            "FilterExpression": '#Address_id in (:val1, :val2, :val3)',

            "ExpressionAttributeNames": {
                '#Address_id': 'ID'
            },
            "ExpressionAttributeValues": {
                ':val1': '123',
                ':val2': '456',
                ':val3': '789'
            },

            Limit: 2
        }


    } else {
            params = {
            TableName: "AddressTable",
            Limit: 2
        };
    }

	if(req.query.startKey_id!== undefined){
		params['ExclusiveStartKey'] = {Address_id:req.query.startKey_id};
	}

	ddb.scan(params, function(err, data) {
   		if (err) console.log(err, err.stack); // an error occurred

        else {
                // adding HATEOAS format
	    	for(let i=0; i<data.Items.length; i++){
	    		data.Items[i]["links"] = [
	    			{"rel":"self", "href":baseURL+data.Items[i].Address_id}
	    		];
	    	}
	    	data["links"] = [
				{"rel":"next", "href":baseURL+"?startKey_id="+data.LastEvaluatedKey.Address_id}
	    	]

                // reply with JSON
	    	res.send(data);
	    	res.end();
	    }
	});
});

// convert object with pairs to array with pairs
function getKeyValuePairs(obj){

    var pairsArr = new Array();
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            //console.log(key + " -> " + obj[key]);
            pairsArr.push(key);
            pairsArr.push(obj[key]);
        }
    }
    return pairsArr;
}


// if obj is not empty, then it is a query string
function isQueryString(obj){
    // is obj empty?
    return !(Object.keys(obj).length === 0 && obj.constructor === Object);
}


//add new address
router.post('/', function(req, res) {
	console.log(req.body);
	let ddb = new AWS.DynamoDB.DocumentClient();
	let add_id = req.body.Address_id;
	let params = {
		TableName : 'AddressTable',
		Item: req.body,
		'ConditionExpression':'attribute_not_exists(Address_id)',
	};
	ddb.put(params, function(err, data) {
		if (err) {
			res.status(400);
			res.send("Address Existed");
			console.log(err);
			res.end();
		}
		else {
			res.status(201);
			res.end();
		}
	});
});


//get address by id
router.get('/:add_id/', function(req, res) {
	let ddb = new AWS.DynamoDB.DocumentClient();
    let add_id = req.params.add_id;
	let params = {
	    TableName : 'AddressTable',
	    Key: {
	      Address_id: add_id
	    }
	};
	ddb.get(params, function(err, data) {
	    if (err || isNaN(add_id)) {
	    	// console.log(err, err.stack); // an error occurred
	    	res.status(400);
	    	res.end("400 Bad Request or the id should be number");
	    }
	    else {
	    	data.Item["links"] = [
		    	{"rel":"self", "href":baseURL+data.Item.Address_id},
		    	{"rel":"Persons", "href":baseURL+data.Item.Address_id+"/Persons"}
	    	];
	    	res.status(200).send(data);
	    	res.end();
	    }
	});
});



//add person to existing address id or delete person from existing address id
router.put('/:add_id/', function(req, res) {
	let ddb = new AWS.DynamoDB.DocumentClient();
    let add_id = req.params.add_id;
    let Delete = req.body.Delete;
    Name = req.body.Persons;
    if(Delete=='true'){
		let params = {
		    TableName : 'AddressTable',
		    Key: {
		      Address_id: add_id,
		    },
		    ProjectionExpression: 'Persons',
		};
		ddb.get(params, function(err, data) {
		    if (err || isNaN(add_id) || !Object.keys(data).length) {
		    	console.log("400 Bad Request or the Address is not in the database"); // an error occurred
		    	res.status(400);
		    	res.end("400 Bad Request or the Address is not in the database");
		    }
		    else {
		    	let Persons = data.Item.Persons;
				console.log(Persons);
				let idx = -1;
				for(let i=0; i<Persons.length; i++){
					if(Persons[i].FirstName==Name[0].FirstName && Persons[i].LastName==Name[0].LastName){
						idx = i;
						break;
					}
				}
				console.log(idx);
				let params_delete = {
				    TableName:"AddressTable",
				    Key:{
				        "Address_id": add_id,
				    },
					'UpdateExpression' : "REMOVE Persons["+idx+"]"
				};
				ddb.update(params_delete, function(err, data) {
				    if (err) {
				        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
				    	res.status(400);
				    	res.end(Name[0].FirstName+Name[0].LastName+" to be deleted is not in the Address_id="+add_id);
				    }
				    else {
				        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
				        res.status(204);
				        res.end(Name[0].FirstName+Name[0].LastName+" has been deleted from Address_id="+add_id);
				    }
				});
		    }
		});
    }

    else{
		let params = {
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
		    	res.status(400);
		    	res.end(Name[0].FirstName+Name[0].LastName+" already exist or the address is not in  the database");
		    }
		    else {
		        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
				res.status(204);
		        res.end(Name[0].FirstName+Name[0].LastName+" added to Address_id="+add_id);
		    }
		});
    }
});

//delete address id
router.delete('/:add_id/', function(req, res) {
	let ddb = new AWS.DynamoDB.DocumentClient();
    let add_id = req.params.add_id;

	let params = {
	    TableName : 'AddressTable',
	    Key: {
	      Address_id: add_id,
	    }
	};

	ddb.delete(params, function(err, data) {
	    if (err || isNaN(add_id)) {
	    	console.log(err);
	    	res.status(400);
	    	res.end("400 Bad Request or the add_id should be number");
	    }
	    else {
	    	res.status(204);
	    	res.end()
	    }
	});
});




// get persons under the address id
router.get('/:add_id/persons', function(req, res) {
	let ddb = new AWS.DynamoDB.DocumentClient();
    let add_id = req.params.add_id;
	let params = {
	    TableName : 'AddressTable',
	    Key: {
	      Address_id: add_id,
	    },
	    ProjectionExpression: 'Persons',
	};
	ddb.get(params, function(err, data) {
	    if (err || isNaN(add_id)) {
	    	res.status(400);
	    	res.end("400 Bad Request or the add_id should be number");
	    }
	    else {
	    	res.status(200).send(data);
	    	res.end();
	    }
	});
});


module.exports = router;

