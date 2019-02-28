const express = require('express');

const router = express.Router();

const bcrypt = require('bcryptjs');

const passport = require('passport');

// Bring in User model
let User = require('../models/user');

// register form
router.get('/register', (req, res)=>{
	res.render('register');
});

// register user
router.post('/register', (req, res)=>{
	const name = req.body.name;
	const email = req.body.email;
	const username = req.body.username;
	const password = req.body.password;
	const password2 = req.body.password2;

	req.checkBody('name', 'The Name Field is required').notEmpty();
	req.checkBody('email', 'The Email Field is required').notEmpty();
	req.checkBody('email', 'The Email is not valid').isEmail();
	req.checkBody('username', 'The Username Field is required').notEmpty();
	req.checkBody('password', 'The Password Field is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	let errors = req.validationErrors();

	if(errors){
		res.render('register')
	}else{

		let newUser = new User({
			name:name,
			email:email,
			username:username,
			password:password
		});

		bcrypt.genSalt(10, function(err, salt){
			bcrypt.hash(newUser.password, salt, function(err, hash){
				if (err)
				{
					console.log(err);
				}
				 newUser.password = hash
				 newUser.save(err=>{
				 	if (err){
				 		console.log(err);
				 		return;
				 	}else{
				 		req.flash('success', 'You are now registered and can login');
				 		res.redirect('login');
				 	}
				 });
			});
		});
	}
});

// login page
router.get('/login', (req, res)=>{
	res.render('login')
});

// login process
router.post('/login', (req, res, next)=>{
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/users/login',
		failureFlash: true
	})(req, res, next);
});

// logout
router.get('/logout', (req, res)=>{
	req.logout();
	req.flash('success', 'You are logged out')
	res.redirect('/users/login');
});

module.exports = router;