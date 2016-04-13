// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');
//var Llama = require('./models/llama');
var Task = require('./models/task');
var User = require('./models/user');
var bodyParser = require('body-parser');
var router = express.Router();

//replace this with your Mongolab URL
mongoose.connect('mongodb://siddhanthm:plmokn@ds021650.mlab.com:21650/mp4sid');

// Create our Express application
var app = express();
app.use(bodyParser.json());
// Use environment defined port or 4000
var port = process.env.PORT || 4000;

//Allow CORS so that backend and frontend could pe put on different servers
var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", 'GET, PUT, POST, DELETE');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
  if('OPTIONS' == req.method)
  	res.send(200);
  else
  	next();
};
app.use(allowCrossDomain);

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}));

// All our routes will start with /api
app.use('/api', router);




//WELCOME PAGE
//GET
//DONE
var homeRoute = router.route('/');

homeRoute.get(function(req, res) {
  res.json({ message: 'Nothing here. Go to /users or /tasks to play with the API.', data:[]});
});






//USER WITHOUT ID
//GET, OPTIONS, POST
//NOT DONE - NEED TO ADD PARAMETERS

var userRoute = router.route('/users');

userRoute.get(function(req,res){
	// User.find(function(err, users) {
 //        // if there is an error retrieving, send the error. nothing after res.status(500).send(err) will execute
 //        if (err)
 //            res.status(500).send(err)

 //        res.json({message:'OK', data:users}); // return all users in JSON format
 //    });
 	var where = eval("("+req.query.where+")");
 	var sort = eval("("+req.query.sort+")");
 	var select = eval("("+req.query.select+")");
 	var skip = eval("("+req.query.skip+")");
 	var limit = eval("("+req.query.limit+")");
 	var count = eval("("+req.query.count+")");
 	if(count){
 		User.find(where).sort(sort).select(select).skip(skip).limit(limit).count(count).exec(function(err, users){
 			if(err)
 				res.status(500).send(err);
 			else
 				res.status(200).send({message:'OK', data:users});
 		});
 	}else{
 		User.find(where).sort(sort).select(select).skip(skip).limit(limit).exec(function(err, users){
 			if(err)
 				res.status(500).send(err);
 			else
 				res.status(200).send({message:'OK', data:users});
 		});
 	}

});

userRoute.options(function(req, res){
	res.writeHead(200);
    res.end();
});

userRoute.post(function(req,res){
	var tasks;
	if(req.body.pendingTasks)
		tasks = req.body.pendingTasks;
	else
		tasks = [];
	
	if(!req.body.name || !req.body.email)
		res.status(500).send({message: "User must have email and name"});
	else{
		User.find({email:req.body.email}, function(err, userif){
			if(err)
				res.status(500).send(err);
			else if(userif.length != 0){
				res.status(500).send({message: "User Already Exist!"});
			}
			else{
				User.create({
					name: req.body.name,
					email : req.body.email,
					pendingTasks : tasks
				},function(err, users){
					if(err)
						res.status(500).send(err);
					else{
						res.status(201).json({message:'User Added!', data:users});
					}
				});
			}
		});
	}
});




//USER WITH ID
//GET, DELETE, PUT 
//DONE

var userRouteId = router.route('/users/:id');

userRouteId.get(function(req,res){
	//res.send(req.params.id);
	User.findById(req.params.id, function(err, users){
		if(err)
			res.status(500).send(err);
		else if(users == undefined)
			res.status(404).send({message:'User Does Not Exist', data:[]});
		else
			res.json({message:'OK', data:users});
	});
});

userRouteId.delete(function(req,res){
	User.findById(req.params.id, function(err, users){
		if(err)
			res.status(500).send(err);
		else if(users == undefined)
			res.status(404).send({message:'User Does Not Exist'});
		else{
			User.findByIdAndRemove(req.params.id, function(err,user){
				if(err)
					res.status(500).send(err);
				User.find(function(err, users) {
            		if (err)
               			res.status(500).send(err)
            		res.json({message:'User Deleted!', data:users});
       		 	});
			});
		}
	});
});

userRouteId.put(function(req,res){
	User.findById(req.params.id, function(err, users){
		if(err)
			res.status(500).send(err);
		else if(users == undefined)
			res.status(404).send({message:'User Does Not Exist', data:[]});
		else{
			//console.log(users.data);
			var tasks;
			if(req.body.pendingTasks)
				tasks = req.body.pendingTasks;
			else
				tasks = [];

			if(!req.body.name || !req.body.email)
				res.status(500).send({message: "User must have email and name"});
			else{
				//User.find({email:req.body.email, _id:{$not:{$eq: req.params.id}}}, function(err, userif){
					/*if(err)
						res.status(500).send(err);
					else if(userif.length != 0){
						res.status(500).send({message: "User Already Exist!"});
					}else{*/
						User.findByIdAndUpdate(req.params.id, {
							name: req.body.name,
							email: req.body.email,
							pendingTasks: tasks
						}, function(err, users){
							if(err)
								res.status(500).send(err);
							else{
								User.findById(req.params.id, function(err, users){
									if(err){
										if(err.code == 11000){
											res.status(500).send({message:'User Already Exists!'});
										}else{
											res.status(500).send(err);
										}
									}
									else if(users == undefined)
										res.status(404).send({message:'User Does Not Exist', data:[]});
									else
										res.json({message:'User Updated!', data:users});
								});
							}
						});
					//}
				//});
			}
		}
	});
});

//TASKS WITHOHT ID
//GET, POST, OPTIONS
//NOT DONE - Query

var taskRoute = router.route('/tasks');

taskRoute.get(function(req,res){
 	var where = eval("("+req.query.where+")");
 	var sort = eval("("+req.query.sort+")");
 	var select = eval("("+req.query.select+")");
 	var skip = eval("("+req.query.skip+")");
 	var limit = eval("("+req.query.limit+")");
 	var count = eval("("+req.query.count+")");
 	if(count){
 		Task.find(where).sort(sort).select(select).skip(skip).limit(limit).count(count).exec(function(err, tasks){
 			if(err)
 				res.status(500).send(err);
 			else
 				res.status(200).send({message:'OK', data:tasks});
 		});
 	}else{
 		Task.find(where).sort(sort).select(select).skip(skip).limit(limit).exec(function(err, tasks){
 			if(err)
 				res.status(500).send(err);
 			else
 				res.status(200).send({message:'OK', data:tasks});
 		});
 	}
});

taskRoute.options(function(req, res){
	res.writeHead(200);
    res.end();
});

taskRoute.post(function(req,res){
	var user, userid, deadline, name;
	if(!req.body.assignedUserName || !req.body.assignedUser){
		user = "unassigned";
		userid = "";
	}else{
		user = req.body.assignedUserName;
		userid = req.body.assignedUser;
	}
	if(!req.body.deadline || !req.body.name){
		res.status(500).send({message: "Task must have email and deadline"});
	}else{
		Task.create({
			name: req.body.name,
			description: req.body.description,
			deadline: req.body.deadline,
			complete: req.body.completed,
			assignedUser: userid,
			assignedUserName: user
		},function(err, task){
			if(err)
				res.status(500).send(err);
			res.status(201).send({message: 'Task Created!', data: task});
		});
	}
});


//TASKS WITH ID
//GET, PUT, DELETE
//DONE 

var taskRouteId = router.route('/tasks/:id');

taskRouteId.get(function(req,res){
	Task.findById(req.params.id, function(err, task){
		if(err)
			res.status(500).send(err);
		else if(task == undefined)
			res.status(404).send({message:'Task Does Not Exist'});
		else
			res.json({message: 'OK', data: task});	
	});
});

taskRouteId.delete(function(req,res){
	Task.findById(req.params.id, function(err, task){
		if(err)
			res.status(500).send(err);
		else if(task == undefined)
			res.status(404).send({message:'Task Does Not Exist'});
		else
			Task.findByIdAndRemove(req.params.id, function(err,tasks){
				if(err)
					res.status(500).send(err);
				else
					res.status(200).send({message: 'Task Deleted!'});
			});
	});
});

taskRouteId.put(function(req,res){
	Task.findById(req.params.id, function(err, task){
		if(err)
			res.status(500).send(err);
		else if(task == undefined)
			res.status(404).send({message:'Task Does Not Exist'});
		else{
			var user, userid, deadline, name;
			if(!req.body.assignedUserName || !req.body.assignedUser){
				user = "unassigned";
				userid = "";
			}else{
				user = req.body.assignedUserName;
				userid = req.body.assignedUser;
			}
			if(!req.body.deadline || !req.body.name){
				res.status(500).send({message: "Task must have email and deadline"});
			}else{
				Task.findByIdAndUpdate(req.params.id,
				{
					name: req.body.name,
					description: req.body.description,
					deadline: req.body.deadline,
					complete: req.body.completed,
					assignedUser: userid,
					assignedUserName: user
				},function(err, tasks){
					if(err)
						res.status(500).send(err);
					else{
						Task.findById(req.params.id,function(err, taskupdate){
							if(err)
								res.status(500).send(err);
							else{
								res.status(200).send({message:'User Updated!', data: taskupdate});
							}
						});
					}
				});
	 		}
		}
	});
});

// Start the server
app.listen(port);
console.log('Server running on port ' + port);
