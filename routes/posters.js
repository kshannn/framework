const express = require('express');
const router = express.Router();

 // #1 import in the Posters model
const { Posters } = require('../models')
// #2 import in forms
const { bootstrapField, createPosterForm } = require('../forms')

router.get('/', async (req,res)=>{
     // #2 - fetch all the products (ie, SELECT * from posters)
    let posters = await Posters.collection().fetch();
    res.render('posters/index',{
        'posters': posters.toJSON()
    })
})

router.get('/create', async(req,res)=> {
    const posterForm = createPosterForm();
    res.render('posters/create',{
        'form': posterForm.toHTML(bootstrapField)
    })
})

router.post('/create', async(req,res) => {
    const posterForm = createPosterForm();
    posterForm.handle(req, {
        'success': async (form) => {
            const poster = new Posters();
            poster.set('title', form.data.title);
            poster.set('cost',form.data.cost);
            poster.set('description', form.data.description);
            poster.set('date', form.data.date);
            poster.set('stock', form.data.stock);
            poster.set('height', form.data.height);
            poster.set('width', form.data.width);
            await poster.save();
            res.redirect('/posters')
        },
        'error': async (form) => {
            res.render('posters/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:poster_id/update', async (req,res) => {
    const posterId = req.params.poster_id

    const poster = await Posters.where({
        id: posterId
    }).fetch({
        require: true
    })

    const posterForm = createPosterForm();

    posterForm.fields.title.value = poster.get('title');
    posterForm.fields.cost.value = poster.get('cost');
    posterForm.fields.description.value = poster.get('description');
    posterForm.fields.date.value = poster.get('date');
    posterForm.fields.stock.value = poster.get('stock');
    posterForm.fields.height.value = poster.get('height');
    posterForm.fields.width.value = poster.get('width')

    res.render('posters/update',{
        'form': posterForm.toHTML(bootstrapField),
        'poster': poster.toJSON()
    })
})


router.post('/:poster_id/update', async (req,res) => {
    const posterId = req.params.poster_id

    const poster = await Posters.where({
        id: posterId
    }).fetch({
        require: true
    })

    const posterForm = createPosterForm();
    posterForm.handle(req, {
        'success': async (form) => {
            poster.set(form.data);
            poster.save();
            res.redirect('/posters')
        },
        'error': async (form) => {
            res.render('posters/update', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })

})

router.get('/:poster_id/delete', async (req,res)=>{
    posterId = req.params.poster_id

    const poster = await Posters.where({
        id: posterId
    }).fetch({
        require: true
    })

    res.render('posters/delete', {
        'poster': poster.toJSON()
    })
})

router.post('/:poster_id/delete', async (req,res) => {
    posterId = req.params.poster_id

    const poster = await Posters.where({
        id: posterId
    }).fetch({
        require: true
    })

    await poster.destroy();
    res.redirect('/posters')

})

module.exports = router;