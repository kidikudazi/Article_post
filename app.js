const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');



// connect to database
mongoose.connect(process.env.MONGOLAB_URI || config.database, {useNewUrlParser:true});
mongoose.Promise = global.Promise;
let db = mongoose.connection;

// check connection
db.once('open', function(){
	console.log('Connected to mongo db');
});

// check for db errors
db.on('error', function(err){
	console.log(err);
});

// init App
const app = express();

// bring in models
let Article = require('./models/article');

// load view engine
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'pug');


// body parser Middleware parse application
app.use(bodyParser.urlencoded({extended: false }));

// parse application/json
app.use(bodyParser.json());

// set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Express session middleware
app.use(session({
	secret: 'Keyboard cat',
	resave: true,
	saveUninitialized:true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function(req, res, next){
	res.locals.messages = require('express-messages')(req, res);
	next();
});


// Express Validtor Middleware
app.use(expressValidator({
	errorFormatter: function(param, msg, value){
		var namespace = param.split('.')
		, root = namespace.shift()
		, formParam = root;

		while(namespace.length){
			formParam += '['+ namespace.shift() + ']';
		}
		return {
			param : formParam,
			msg : msg,
			value : value
		};
	}
}));

// passport config
require('./config/passport')(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
	res.locals.user = req.user || null;
	next();
});
// home route
app.get('/', (req, res)=>{
	Article.find({}, (err, articles)=>{
		if (err) {
			console.log(err);
		}else{

			res.render('index', {
				title:'articles',
				articles: articles
			});
		}
	});
});

// bring in Route files
let articles = require('./routes/articles');

let users = require('./routes/users');

app.use('/articles', articles);

app.use('/users', users);

// set port
const port = process.env.PORT || 5000;

// start server
app.listen(port, function(){
	console.log(`Server started on port ${port}...`);
});
