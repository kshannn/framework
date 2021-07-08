const express = require('express');
const router = express.Router();

 // #1 import in the Posters and Categories model
const { Posters, Categories, Tag } = require('../models')
// #2 import in forms
const { bootstrapField, createPosterForm } = require('../forms')

router.get('/', async (req,res)=>{
     // #2 - fetch all the products (ie, SELECT * from posters)
    let posters = await Posters.collection().fetch({
        withRelated: ['category']
    });
    console.log(posters)
    res.render('posters/index',{
        'posters': posters.toJSON()
    })
})

// ========= CREATE poster =========
router.get('/create', async(req,res)=> {
    const choices = await Categories.fetchAll().map((category)=>{
        return [category.get('id'),category.get('name')]
    })

    const allTags = await Tag.fetchAll().map(tag => [tag.get('id'),tag.get('name')])

    const posterForm = createPosterForm(choices, allTags);
    
    res.render('posters/create',{
        'form': posterForm.toHTML(bootstrapField),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    })
})

router.post('/create', async(req,res) => {
    const choices = await Categories.fetchAll().map((category)=>{
        return [category.get('id'),category.get('name')]
    })

    const allTags = await Tag.fetchAll().map(tag => [tag.get('id'),tag.get('name')])


    const posterForm = createPosterForm(choices, allTags);
    posterForm.handle(req, {
        'success': async (form) => {
            let {tags, ...posterData} = form.data;

    
            // const poster = new Posters(form.data);
            const poster = new Posters(posterData);
            
            // poster.set('title', form.data.title);
            // poster.set('cost',form.data.cost);
            // poster.set('description', form.data.description);
            // poster.set('date', form.data.date);
            // poster.set('stock', form.data.stock);
            // poster.set('height', form.data.height);
            // poster.set('width', form.data.width);
            await poster.save();

            if (tags){
                await poster.tags().attach(tags.split(','))
            }

            req.flash('success_messages', `New poster ${poster.get('title')} has been created`)
            res.redirect('/posters')
        },
        'error': async (form) => {
            res.render('posters/create', {
                'form': form.toHTML(bootstrapField)
            })
            req.flash('error_messages','Error creating the poster')
        }
    })
})

// ========= UPDATE poster =========

router.get('/:poster_id/update', async (req,res) => {
    const posterId = req.params.poster_id

    const poster = await Posters.where({
        id: posterId
    }).fetch({
        require: true,
        withRelated:['tags']
    })

    // fetch all the tags
    const allTags = await Tag.fetchAll().map(tag => [tag.get('id'),tag.get('name')])

    const choices = await Categories.fetchAll().map((category)=>{
        return [category.get('id'),category.get('name')]
    })

    const posterForm = createPosterForm(choices, allTags);

    // fill in existing values
    posterForm.fields.title.value = poster.get('title');
    posterForm.fields.cost.value = poster.get('cost');
    posterForm.fields.description.value = poster.get('description');
    posterForm.fields.date.value = poster.get('date');
    posterForm.fields.stock.value = poster.get('stock');
    posterForm.fields.height.value = poster.get('height');
    posterForm.fields.width.value = poster.get('width');
    posterForm.fields.category_id.value = poster.get('category_id');

    // fill in the multi-select for the tags
    let selectedTags =  await poster.related('tags').pluck('id');
    posterForm.fields.tags.value = selectedTags;

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