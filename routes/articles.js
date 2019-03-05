const express = require('express');

const router = express.Router();

// Bring in article model
let Article = require('../models/article');

// Bring in User model
let User = require('../models/user');
// ADD Route
router.get('/add', ensureAuth,(req, res)=>{
	res.render('add_article', {
		title: 'Add Article'
	});
})

// Add submit post route
router.post('/add', function(req, res){

	// set validation
	req.checkBody('title', 'Title is required').notEmpty();
	//req.checkBody('author', 'Author is required').notEmpty();
	req.checkBody('body', 'Body is required').notEmpty();


	// get errors
	let errors = req.validationErrors();

	if (errors) {
		res.render('add_article', {
			title : 'Add Article', 
			errors : errors
		})
	}else{

		let article = new Article();
		article.title = req.body.title;
		article.author = req.user._id;
		article.body = req.body.body;

		article.save(function(err){
			if(err){
				console.log(err);
				return;
			}else{
				req.flash('success', 'Article Added');
				res.redirect('/');
			}
		});
	}
});

// Load edit form
router.get('/edit/:id', ensureAuth, (req, res)=>{
	Article.findById(req.params.id, function(err, article){
		if (err) {
			console.log(err);
		}else{
			if(article.author != req.user._id)
			{
				req.flash('danger', 'Not Authorized');
				res.redirect('/');
			}
			res.render('edit_article', {
				title: 'Edit Aticle',
				article:article
			});
		}
	});
});

// update the article
router.post('/edit/:id', function(req, res){
	let article = {};

	article.title = req.body.title;
	//article.author = req.body.author;
	article.body = req.body.body;

	let query = {_id:req.params.id};

	Article.update(query, article, function(err){
		if(err){
			console.log(err);
			return;
		}else{
			req.flash('success', 'Article Updated');
			res.redirect('/');
		}
	});
});


// delete the article
router.delete('/:id', (req, res)=>{
	if (!req.user._id){
		res.status(500).send();
	}

	let query = {_id:req.params.id};

	Article.findById(req.params.id, function(err, article){
		if (article.author != req.user._id){
			res.status(500).send();
		}else{
			Article.deleteOne(query, function(err){
				if (err) 
				{
					console.log(err);
				}else{
					res.send('Success');
				}
			});
		}
	});

	
});

// get single article
router.get('/:id', (req, res)=>{
	Article.findById(req.params.id, function(err, article){
		if (err) {
			console.log(err);
		}else{
			User.findById(article.author, function(err, user){

				res.render('article', {
					article:article,
					author:user.name
				});
			});
		}
	});
});

// Access control
function ensureAuth(req, res, next){
	if (req.isAuthenticated()){
		return next();
	}else{
		req.flash('danger', 'Please Login');
		res.redirect('/users/login');
	}
}
module.exports = router;