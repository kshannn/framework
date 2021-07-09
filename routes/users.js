const express = require('express');
const router = express.Router();

// import user bookshelf model
const { User } = require('../models');

// import caolan forms
const { createRegistrationForm, createLoginForm, bootstrapField } = require('../forms');


// display registration page
router.get('/register', (req,res)=>{
    const registerForm = createRegistrationForm();
    res.render('users/register', {
        'form': registerForm.toHTML(bootstrapField)
    })
})

// process registration form
router.post('/register', async (req,res)=>{
    const registerForm = createRegistrationForm();
    registerForm.handle(req, {
        success: async (form) => {
            const user = new User ({
                'username': form.data.username,
                'password': form.data.password,
                'email': form.data.email
            });
            await user.save();
            req.flash('success_messages', 'User signed up successfully');
            res.redirect('/users/login')
        },
        error: (form) => {
            res.render('users/register', {
                'form':form.toHTML(bootstrapField)
            }),
            req.flash('error_messages', 'Failed login');
        }
    })
})


// user log in 
router.get('/login', (req,res) => {
    const loginForm = createLoginForm();
    res.render('users/login',{
        'forms': loginForm.toHTML(bootstrapField)
    })
})

// process user log in information
router.post('/login', (req,res) => {
    const loginForm = createLoginForm();
    loginForm.handle(req,{
        'success': async (form) => {
            // process login
            let user = await User.where({
                'email': form.data.email
            }).fetch({
                require: false
            })

            if(!user) {
                req.flash("error_messages","Sorry, the authentication details you provided are invalid")
                res.redirect('/users/login')
            } else {
                // check if pw match
                if(user.get('password') === form.data.password){
                    // add to session the user details if login succeed
                    req.session.user = {
                        id: user.get('id'),
                        username: user.get('username'),
                        email: user.get('email')
                    }
                    req.flash('success_messages','Welcome back,' + user.get('username'))
                    res.redirect('/users/profile')
                } else {
                    req.flash('error_messages','Sorry, the authentication details you provided are invalid')
                    res.redirect('/users/login')
                }
                
            }
        },
        'error': (form) => {
            req.flash('error_messages', 'There are some problems logging you in. Please fill the form again.')
            res.render('users/login',{
                'forms': form.toHTML(bootstrapField)
            })
        }
    })
})

// display profile 
router.get('/profile', (req,res) => {
    const user = req.session.user

    if(!user){
        req.flash('error_messages','You do not have the permission to view this')
        res.redirect('/users/login')
    } else {
        res.render('users/profile', {
            'user': user
        })
    }
})

router.get('/logout', (req,res) => {
    // remove the session
    req.session.user = null;
    req.flash('success_messages','Goodbye')
    res.redirect('/users/login')
})


module.exports = router;
