const express = require('express');
const router = express.Router();

// import user bookshelf model
const { User } = require('../models');

// import caolan forms
const { createRegistrationForm, bootstrapField } = require('../forms');


// display registration page
router.get('/register', (req,res)=>{
    const registerForm = createRegistrationForm();
    res.render('users/register', {
        'form': registerForm.toHTML(bootstrapField)
    })
})

// process registration form
router.post('/register', (req,res)=>{
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
            res.redirect('users/login')
        },
        error: (form) => {
            res.render('users/register', {
                'form':form.toHTML(bootstrapField)
            }),
            req.flash('error_messages', 'Failed login');
        }
    })
})


module.exports = router;
