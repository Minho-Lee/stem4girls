/*eslint-env node*/
// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var cfenv = require('cfenv');
var Cloudant = require('cloudant');
var fs = require('fs');
var cons = require('consolidate');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
//var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(path.join(__dirname , 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.engine('html', cons.swig);
app.set('view engine', 'html');
//setting up cloudant
var cloudant_url = 'https://34472626-3368-4635-ab44-90934808150e-bluemix:7b0e135776c9e8092769a8de9c1a567220d86c29ce7dc684ac87b9f1acf1180c@34472626-3368-4635-ab44-90934808150e-bluemix.cloudant.com';
var services = JSON.parse(process.env.VCAP_SERVICES || "{}");
// Check if services are bound to your project
if (process.env.VCAP_SERVICES) {
    services = JSON.parse(process.env.VCAP_SERVICES);
    if (services.cloudantNoSQLDB) //Check if cloudantNoSQLDB service is bound to your project
    {
        cloudant_url = services.cloudantNoSQLDB[0].credentials.url; //Get URL and other paramters
        console.log("Name = " + services.cloudantNoSQLDB[0].name);
        console.log("URL = " + services.cloudantNoSQLDB[0].credentials.url);
        console.log("username = " + services.cloudantNoSQLDB[0].credentials.username);
        console.log("password = " + services.cloudantNoSQLDB[0].credentials.password);
    }
}

var cloudant = Cloudant({
    url: cloudant_url
});

//Edit this variable value to change name of database.
var dbname = 'users';
var db;

//Create database
cloudant.db.create(dbname, function(err, data) {
    db = cloudant.db.use(dbname);
    if (err) //If database already exists
        console.log("stem4girls Database exists."); //NOTE: A Database can be created through the GUI interface as well
    else {
        console.log("Created database.");
        db.insert({
                _id: "_design/users",
                views: {
                    "users": {
                        "map": "function (doc) {\n  emit(doc._id, [doc._rev, doc.username]);\n}"
                    }
                }
            },
            function(err, data) {
                if (err)
                    console.log("View already exists. Error: ", err); //NOTE: A View can be created through the GUI interface as well
                else
                    console.log("users view has been created");
            });
    }
});

app.post('/insertUser', function(req, res) {
    var username = req.body.username;
    console.log(username);
    db.find({
        selector: {
            'username' : username
        }
    }, function(er, result) {
        if (er) {
            throw er;
        }
        eventNames = result.docs;
        
        if (result.docs.length > 0) {
            console.log(eventNames[0]);
            console.log('Found %d documents with name ' + eventNames[0].username, result.docs.length);
            var session = eventNames[0].session;
            console.log(session.number);
            console.log(typeof session.number);
            session.push({
                'number': (parseInt(session.number) + 1),
                'balance': 0
            });


            var user = {
                'username': eventNames[0].username,
                'session' : eventNames[0].session,
                '_id': eventNames[0]._id,
                '_rev': eventNames[0]._rev
            };

            db.insert(user, function(err, body) {});
        } else {
            console.log('Unable to find '+ username);
            db.insert({
                    'username': username,
                    'session': [{
                        'number': 1,
                        'balance': 0
                    }]
                },
                function(err, data) {
                    if (err)
                        console.log("User already exists. Error: ", err); //NOTE: A View can be created through the GUI interface as well
                    else
                        console.log("User has been created");
                });
        }
        res.send('User Saved.')
    });
})

//app.set('view engine', 'ejs');
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

//app.engine('html', require('ejs').renderFile);
//app.set('view engine', 'html');

app.get('/', function(req, res, next) {
	res.render('index.html', { title: 'Stem4Girls' });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(process.env.PORT || 8080);

console.log('Listening on port: ' + (process.env.PORT || 8080));

// get the app environment from Cloud Foundry
//var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
/*app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
*/

module.exports = app;