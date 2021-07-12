const { CartItem } = require('../models')

const getCartItems = async (userId) => {
    return await CartItem.collection().where({
        'user_id': userId
    }).fetch({
        require: false,
        withRelated: ['posters', 'posters.category']
    })
}

const getCartItemByUserAndPoster = async (userId, posterId) => {
    return await CartItem.where({
        'user_id': userId,
        'poster_id': posterId
    }).fetch({
        require: false
    })
}

const addCartItem = async (user_id, poster_id, quantity) => {
    let cartItem = new CartItem({
        'user_id': user_id,
        'poster_id': poster_id,
        'quantity': 1
    })
    await cartItem.save();
}

module.exports = { getCartItems, getCartItemByUserAndPoster, addCartItem }