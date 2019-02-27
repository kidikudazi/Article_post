const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// connect to database
mongoose.connect('mongodb://localhost/nodekb');
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

// body parser middleware parse application
app.use(bodyParser.urlencoded({extended: false }))

// parse application/json
app.use(bodyParser.json())

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


// ADD Route
app.get('/articles/add', (req, res)=>{
	res.render('add_article', {
		title: 'Add Article'
	});
})

// Add submit post route
app.post('/articles/add', function(req, res){
	let article = new Article();
	
	article.title = req.body.title;
	article.author = req.body.author;
	article.body = req.body.body;

	article.save(function(err){
		if(err){
			console.log(err);
			return;
		}else{
			res.redirect('/');
		}
	});
});

// start server
app.listen('3000', function(){
	console.log('Server started on port 3000...')
});
