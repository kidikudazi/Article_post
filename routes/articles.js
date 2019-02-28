const express = require('express');

const router = express.Router();

// Bring in article model
let Article = require('../models/article');
// ADD Route
router.get('/add', (req, res)=>{
	res.render('add_article', {
		title: 'Add Article'
	});
})

// Add submit post route
router.post('/add', function(req, res){

	// set validation
	req.checkBody('title', 'Title is required').notEmpty();
	req.checkBody('author', 'Author is required').notEmpty();
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
		article.author = req.body.author;
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
router.get('/edit/:id', (req, res)=>{
	Article.findById(req.params.id, function(err, article){
		if (err) {
			console.log(err);
		}else{
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
	article.author = req.body.author;
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
	let query = {_id:req.params.id};

	Article.deleteOne(query, function(err){
		if (err) 
		{
			console.log(err);
		}else{
			res.send('Success');
		}
	});
});

// get single article
router.get('/:id', (req, res)=>{
	Article.findById(req.params.id, function(err, article){
		if (err) {
			console.log(err);
		}else{
			res.render('article', {
				article:article
			});
		}
	});
});

module.exports = router;