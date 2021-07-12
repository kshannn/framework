const express = require('express');
const router = express.Router();
const CartServices = require('../services/cart_services')

const { checkIfAuthenticated } = require('../middlewares')


router.get('/', checkIfAuthenticated, async (req,res) => {
    const cartServices = new CartServices (req.session.user.id);
    let cartItems = await cartServices.getCart();
    res.render('shoppingCart/index', {
        'shoppingCart': await cartItems.toJSON()
    })
})



router.get('/:poster_id/add', async (req,res) => {
    // create an object/instance named cart
    let cart = new CartServices(req.session.user.id)
    // accessing addToCart fn, a fn stored in cart object
    cart.addToCart(req.params.poster_id, 1)
    req.flash('success_messages','Item successfuly added to cart')
    res.redirect('/posters')
})

router.get('/:poster_id/remove', async (req, res) => {
    let cartServices = new CartServices (req.session.user.id)
    await cartServices.remove(req.params.poster_id)
    req.flash('success_messages','Item has been removed');
    res.redirect('/shoppingCart')
})

router.post('/:poster_id/quantity/update', async (req,res) => {
    let cartServices = await new CartServices(req.session.user.id)
    await cartServices.setQuantity(req.params.poster_id, req.body.newQuantity)
    req.flash('success_messages','Quantity updated')
    res.redirect('/shoppingCart')
})

module.exports = router;