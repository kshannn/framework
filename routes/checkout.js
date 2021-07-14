const express = require('express')
const router = express.Router();

const CartServices = require('../services/cart_services')
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

router.get('/', async (req, res) => {
    const cart = new CartServices(req.session.user.id)

    // get all items from cart
    let items = await cart.getCart();

    // step 1 - create line items
    let lineItems = [];
    let meta = [];
    for (let item of items){
        const lineItem = {
            'name':item.related('posters').get('title'),
            'amount': item.related('posters').get('cost'),
            'quantity': item.get('quantity'),
            'currency':'SGD'
        }

        // if there is image of item, show it
        if (item.related('posters').get('image_url')){
            lineItem['images'] = [item.related('posters').get('image_url')]
        }

        // put all items in line items
        lineItems.push(lineItem)

        // save the quantity data along with poster id
        meta.push({
            'poster_id': item.get('poster_id'),
            'quantity': item.get('quantity')
        })

    }
    // step 2 - create stripe payment
    let metaData = JSON.stringify(meta)
    const payment = {
        payment_method_types: ['card'],
        line_items: lineItems,
        success_url: process.env.STRIPE_SUCCESS_URL + '?sessionId ={CHECKOUT_SESSION_ID}',
        cancel_url: process.env.STRIPE_ERROR_URL,
        metadata: {
            'orders': metaData
        }
    }

    // step 3: register the session
    let stripeSession = await Stripe.checkout.sessions.create(payment)
    res.render('checkout/checkout', {
        'sessionId': stripeSession.id, // 4. get session id
        'publishableKey': process.env.STRIPE_PUBLISHABLE_KEY
    })
})





module.exports = router;