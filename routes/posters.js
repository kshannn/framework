const express = require('express');
const router = express.Router();

 // #1 import in the Posters and Categories model
const { Posters, Categories, Tag } = require('../models')
// #2 import in forms
const { bootstrapField, createPosterForm, createSearchForm } = require('../forms')

// #3 import checkIfAuthenticated middleware
const { checkIfAuthenticated } = require('../middlewares')

// #4 import DAL
const { getAllCategories, getAllTags, getPosterById } = require('../dal/posters')

router.get('/', async (req,res)=>{
     // #2 - fetch all the products (ie, SELECT * from posters)
    // let posters = await Posters.collection().fetch({
    //     withRelated: ['category','tags']
    // });

    // res.render('posters/index',{
    //     'posters': posters.toJSON()
    // })

    const allCategories = await getAllCategories();
    allCategories.unshift([0, '----'])

    const allTags = getAllTags();

    // create search form 
    const searchForm = createSearchForm (allCategories, allTags);
    let q = Posters.collection()
    
    

    searchForm.handle(req, {
        'empty': async (form) => {
            let posters = await q.fetch({
                withRelated: ['category','tags']
            })

            res.render('posters/index', {
                'posters': posters.toJSON(),
                'form': form.toHTML(bootstrapField)
            })

        },
        'error': async (form) => {
            let posters = await q.fetch({
                withRelated: ['category','tags']
            })

            res.render('posters/index', {
                'posters': posters.toJSON(),
                'form': form.toHTML(bootstrapField)
            })
        },
        'success': async (form) => {
            console.log('form data', form.data['min-cost'])

           if (form.data.name) {
               q = q.where('name', 'like', '%' + form.data.name + '%')
           }

           console.log('min cost: ', form.data['min_cost'])
           
           if (form.data['min_cost']) {
                q= q.where('cost', '>=', form.data['min_cost'])
           }

           if (form.data.max_cost) {
                q= q.where('cost', '<=', form.data.max_cost)
            }

           if (form.data.category_id && form.data.category_id != "0") {
                q = q.where('category_id', '=', form.data.category_id);
            }

            if (form.data.tags){
                q = q.query('join', 'posters_tags', 'posters.id','poster_id').where('tag_id', 'in', form.data.tags.split(','))
            }

            // console.log(q.query().toSQL());

            let posters = await q.fetch({
                withRelated: ['category','tags']
            })


            res.render('posters/index', {
                'posters': posters.toJSON(),
                'form': form.toHTML(bootstrapField)
            })

        }
    })

})

// ========= CREATE poster =========
router.get('/create', checkIfAuthenticated, async(req,res)=> {
    const allCategories = await getAllCategories();

    const allTags = await getAllTags();

    const posterForm = createPosterForm(allCategories, allTags);
    
    res.render('posters/create',{
        'form': posterForm.toHTML(bootstrapField),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    })
})

router.post('/create', checkIfAuthenticated, async(req,res) => {
    const allCategories = await getAllCategories();

    const allTags = await getAllTags();


    const posterForm = createPosterForm(allCategories, allTags);
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

router.get('/:poster_id/update', checkIfAuthenticated, async (req,res) => {
    const posterId = req.params.poster_id

    const poster = await getPosterById(posterId);

    // fetch all the tags
    const allTags = await getAllTags();

    const allCategories = await getAllCategories();

    const posterForm = createPosterForm(allCategories, allTags);

    // fill in existing values
    posterForm.fields.title.value = poster.get('title');
    posterForm.fields.cost.value = poster.get('cost');
    posterForm.fields.description.value = poster.get('description');
    posterForm.fields.date.value = poster.get('date');
    posterForm.fields.stock.value = poster.get('stock');
    posterForm.fields.height.value = poster.get('height');
    posterForm.fields.width.value = poster.get('width');
    posterForm.fields.category_id.value = poster.get('category_id');
    posterForm.fields.image_url.value = poster.get('image_url')

    // fill in the multi-select for the tags
    let selectedTags =  await poster.related('tags').pluck('id');
    posterForm.fields.tags.value = selectedTags;




    res.render('posters/update',{
        'form': posterForm.toHTML(bootstrapField),
        'poster': poster.toJSON(),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey:process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset:process.env.CLOUDINARY_UPLOAD_PRESET
    })
})


router.post('/:poster_id/update', checkIfAuthenticated, async (req,res) => {
    const posterId = req.params.poster_id

    const poster = await getPosterById(posterId);

    const posterForm = createPosterForm();
    posterForm.handle(req, {
        'success': async (form) => {
            let {tags, ... productData} = form.data
            poster.set(productData);
            poster.save();

            // update the tags
            let tagIds = tags.split(',')
    

            let existingTagIds = await poster.related('tags').pluck('id')
           

            // remove all tags that aren't selected
            let toRemove = existingTagIds.filter( id => tagIds.includes(id.toString()) === false)
            await poster.tags().detach(toRemove);
            
        
            // add in all tags selected in the form
            await poster.tags().attach(tagIds)

            res.redirect('/posters')
        },
        'error': async (form) => {
            res.render('posters/update', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })

})

router.get('/:poster_id/delete', checkIfAuthenticated, async (req,res)=>{
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

router.post('/:poster_id/delete', checkIfAuthenticated, async (req,res) => {
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