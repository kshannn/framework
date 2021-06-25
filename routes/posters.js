const express = require('express');
const router = express.Router();

 // #1 import in the Posters model
const { Posters } = require('../models')

router.get('/', async (req,res)=>{
     // #2 - fetch all the products (ie, SELECT * from posters)
    let posters = await Posters.collection().fetch();
    res.render('posters/index',{
        'posters': posters.toJSON()
    })
})

module.exports = router;